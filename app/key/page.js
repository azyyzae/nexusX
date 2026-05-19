'use client'

import { useState, useEffect, useCallback } from 'react'
import AntiDebug from './anti-debug'

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

function StepDot({ n, label, current, done }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: done ? '#3a7bc8' : current ? '#1a2a4a' : 'transparent',
        border: `2px solid ${done ? '#3a7bc8' : current ? '#6080b0' : '#1a2a40'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8em', fontWeight: 600,
        color: done ? '#fff' : current ? '#8ab8f0' : '#3a4a5a',
        transition: '0.3s'
      }}>{done ? '✓' : n}</div>
      <span style={{ fontSize: '0.7em', color: current ? '#6080b0' : '#3a4a5a' }}>{label}</span>
    </div>
  )
}

export default function KeyPage() {
  const [step, setStep] = useState(null)
  const [key, setKey] = useState(null)
  const [error, setError] = useState(null)
  const [secondRound, setSecondRound] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  const handleHash = useCallback(async (hash) => {
    setStep(2)
    try {
      const res = await fetch(`/api/verify-linkvertise?hash=${hash}`)
      const data = await res.json()
      if (!data.success) {
        window.location.href = data.redirect || '/key?error=bypass'
        return
      }
      if (data.needSecond) {
        setStep(1)
        return
      }
      const nextRes = await fetch('/api/verify-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token })
      })
      const nextData = await nextRes.json()
      if (nextData.success) {
        setKey(getCookie('k_key'))
        setStep(3)
      } else {
        window.location.href = nextData.redirect || '/key?error=bypass'
      }
    } catch {
      window.location.href = '/key?error=error'
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = params.get('hash')
    const errorParam = params.get('error')

    if (getCookie('k_bypass') === 'true' || errorParam === 'bypass') {
      const msg = params.get('msg')
      window.history.replaceState({}, '', '/key')
      setError(msg || 'bypass')
      return
    }

    if (errorParam) {
      window.history.replaceState({}, '', '/key')
      setError(errorParam)
      return
    }

    if (getCookie('k_key')) {
      setKey(getCookie('k_key'))
      setStep(3)
      const expires = getCookie('k_expires')
      if (expires) {
        const update = () => {
          const diff = new Date(expires).getTime() - Date.now()
          if (diff <= 0) { setTimeLeft('expired'); return }
          const h = Math.floor(diff / 3600000)
          const m = Math.floor((diff % 3600000) / 60000)
          const s = Math.floor((diff % 60000) / 1000)
          setTimeLeft(`${h}h ${m}m ${s}s`)
        }
        update()
        const iv = setInterval(update, 1000)
        return () => clearInterval(iv)
      }
      return
    }

    if (hash) {
      window.history.replaceState({}, '', '/key')
      handleHash(hash)
      return
    }

    const cp = getCookie('k_checkpoint')
    if (cp === '2') {
      setSecondRound(true)
      setStep(1)
      return
    }

    setStep(1)
  }, [handleHash])

  const bg = 'linear-gradient(135deg, #0a0e18 0%, #0f1a2e 50%, #0a0e18 100%)'
  const cardBg = 'rgba(20, 30, 50, 0.6)'
  const border = '1px solid rgba(60, 80, 120, 0.3)'

  if (error) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, fontFamily: 'monospace' }}>
        <div style={{ padding: '24px 32px', background: cardBg, border, borderRadius: '8px', color: '#b06060', fontSize: '0.9em' }}>{error}</div>
      </main>
    )
  }

  if (step === 3 && key) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, fontFamily: 'monospace', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '30px', display: 'flex', gap: '60px', alignItems: 'center' }}>
          <StepDot n={1} label="1/2 link" current={false} done={true} />
          <StepDot n={2} label="2/2 link" current={false} done={true} />
          <StepDot n={3} label="complete" current={true} done={false} />
        </div>
        <div style={{
          background: cardBg, border, borderRadius: '12px',
          padding: '36px 48px', backdropFilter: 'blur(12px)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#3a4a5a', fontSize: '0.75em', marginBottom: '12px', letterSpacing: '2px' }}>YOUR KEY</div>
          <div style={{ color: '#8ab8f0', fontSize: '1.15em', letterSpacing: '1px', fontFamily: 'monospace' }}>{key}</div>
          <div style={{ color: timeLeft === 'expired' ? '#b06060' : '#3a4a5a', fontSize: '0.7em', marginTop: '16px' }}>{timeLeft || '12h 0m 0s'}</div>
        </div>
      </main>
    )
  }

  if (step === 2) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, fontFamily: 'monospace', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '30px', display: 'flex', gap: '60px', alignItems: 'center' }}>
          <StepDot n={1} label="1/2 link" current={false} done={true} />
          <StepDot n={2} label="2/2 link" current={true} done={false} />
          <StepDot n={3} label="complete" current={false} done={false} />
        </div>
        <div style={{ width: '28px', height: '28px', border: '2px solid #1a2a40', borderTop: '2px solid #6080b0', borderRadius: '50%', animation: 's 1s linear infinite' }} />
        <style>{'@keyframes s { to { transform: rotate(360deg) } }'}</style>
      </main>
    )
  }

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, fontFamily: 'monospace', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '30px', display: 'flex', gap: '60px', alignItems: 'center' }}>
        <StepDot n={1} label="1/2 link" current={!secondRound} done={secondRound} />
        <StepDot n={2} label="2/2 link" current={secondRound} done={false} />
        <StepDot n={3} label="complete" current={false} done={false} />
      </div>
      <div style={{
        background: cardBg, border, borderRadius: '12px',
        padding: '40px 56px', backdropFilter: 'blur(12px)',
        textAlign: 'center'
      }}>
        <div style={{ color: '#3a4a5a', fontSize: '0.75em', marginBottom: '8px', letterSpacing: '2px' }}>
          {secondRound ? 'STEP 2 OF 2' : 'STEP 1 OF 2'}
        </div>
        <div style={{ color: '#5a7a9a', fontSize: '0.85em', marginBottom: '24px' }}>
          {secondRound ? 'complete one more verification' : 'complete the verification'}
        </div>
        <button
          onClick={() => window.location.href = '/api/start-linkvertise'}
          style={{
            padding: '12px 48px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #1a2a4a 0%, #2a4a7a 100%)',
            color: '#8ab8f0', border: '1px solid rgba(60, 100, 160, 0.4)',
            cursor: 'pointer', fontFamily: 'monospace',
            fontSize: '0.85em', letterSpacing: '1px',
            transition: '0.2s'
          }}
          onMouseEnter={e => { e.target.style.background = 'linear-gradient(135deg, #2a4a7a 0%, #3a6a9a 100%)'; e.target.style.borderColor = '#4a8fe0' }}
          onMouseLeave={e => { e.target.style.background = 'linear-gradient(135deg, #1a2a4a 0%, #2a4a7a 100%)'; e.target.style.borderColor = 'rgba(60, 100, 160, 0.4)' }}
        >
          continue
        </button>
      </div>
    </main>
  )
}
