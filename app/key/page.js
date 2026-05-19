'use client'

import { useState, useEffect, useCallback } from 'react'
import AntiDebug from './anti-debug'

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

const bg = '#0e1420'
const fg = '#6080b0'
const dim = '#1a2a40'
const active = '#3a7bc8'

function StepDots({ current }) {
  const labels = ['linkvertise', 'verify', 'complete']
  return (
    <div style={{ position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0', alignItems: 'center' }}>
      {[1, 2, 3].map((n, i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && <div style={{ width: '40px', height: '1px', background: current >= n ? active : dim }} />}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: current >= n ? active : 'transparent',
              border: `2px solid ${current >= n ? active : dim}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7em', color: current >= n ? '#fff' : dim,
              transition: '0.2s'
            }}>{n}</div>
            <span style={{ fontSize: '0.6em', color: current === n ? fg : dim }}>{labels[i]}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function KeyPage() {
  const [step, setStep] = useState(null)
  const [key, setKey] = useState(null)
  const [error, setError] = useState(null)

  const handleHash = useCallback(async (hash) => {
    setStep(2)
    try {
      const res = await fetch(`/api/verify-linkvertise?hash=${hash}`)
      const data = await res.json()
      if (!data.success) {
        window.location.href = data.redirect || '/key?error=bypass'
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
      setError('bypass')
      return
    }

    const keyVal = getCookie('k_key')
    if (keyVal) {
      setKey(keyVal)
      setStep(3)
      return
    }

    if (hash) {
      window.history.replaceState({}, '', '/key')
      handleHash(hash)
      return
    }

    if (getCookie('k_checkpoint') === '3') {
      setKey(getCookie('k_key'))
      setStep(3)
      return
    }

    if (getCookie('k_checkpoint') === '2') {
      fetch('/api/start-session', { method: 'POST' })
        .then(() => setStep(1))
        .catch(() => setError('session'))
      return
    }

    fetch('/api/start-session', { method: 'POST' })
      .then(() => setStep(1))
      .catch(() => setError('session'))
  }, [handleHash])

  if (error) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, color: fg, fontFamily: 'monospace' }}>
        <pre style={{ color: '#b06060' }}>{error === 'bypass' ? 'blocked' : 'error'}</pre>
      </main>
    )
  }

  if (step === 3 && key) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, position: 'relative', fontFamily: 'monospace' }}>
        <AntiDebug />
        <StepDots current={3} />
        <div style={{
          padding: '28px 40px',
          border: '1px solid ' + active,
          color: '#8ab8f0',
          fontSize: '1.1em',
          letterSpacing: '1px'
        }}>{key}</div>
      </main>
    )
  }

  if (step === 2) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, position: 'relative', fontFamily: 'monospace' }}>
        <AntiDebug />
        <StepDots current={2} />
        <div style={{ width: '24px', height: '24px', border: '2px solid ' + dim, borderTop: '2px solid ' + fg, borderRadius: '50%', animation: 's 1s linear infinite' }} />
        <style>{'@keyframes s { to { transform: rotate(360deg) } }'}</style>
      </main>
    )
  }

  if (step === null) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, fontFamily: 'monospace' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid ' + dim, borderTop: '2px solid ' + fg, borderRadius: '50%', animation: 's 1s linear infinite' }} />
        <style>{'@keyframes s { to { transform: rotate(360deg) } }'}</style>
      </main>
    )
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg, position: 'relative', fontFamily: 'monospace' }}>
      <AntiDebug />
      <StepDots current={1} />
      <button
        onClick={() => window.location.href = 'https://linkvertise.com/3037608/GIQY2zNR931p'}
        style={{
          padding: '12px 40px',
          background: dim,
          color: fg,
          border: '1px solid ' + fg,
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '0.9em',
          transition: '0.15s'
        }}
        onMouseEnter={e => { e.target.style.background = active; e.target.style.color = '#fff' }}
        onMouseLeave={e => { e.target.style.background = dim; e.target.style.color = fg }}
      >
        continue
      </button>
    </main>
  )
}
