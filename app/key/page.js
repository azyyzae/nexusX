'use client'

import { useState, useEffect } from 'react'
import AntiDebug from './anti-debug'

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

export default function KeyPage() {
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')

    if (getCookie('k_bypass') === 'true' || errorParam === 'bypass') {
      setError('bypass')
      setLoading(false)
      return
    }

    const keyVal = getCookie('k_key')
    if (keyVal) {
      setKey(keyVal)
      setLoading(false)
      return
    }

    const cp = getCookie('k_checkpoint')
    if (cp && cp !== '1') {
      setLoading(false)
      return
    }

    fetch('/api/start-session', { method: 'POST' })
      .then(() => setLoading(false))
      .catch(() => {
        setError('session')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0e1420', color: '#6080b0', fontFamily: 'monospace' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid #1a2a40', borderTop: '2px solid #6080b0', borderRadius: '50%', animation: 's 1s linear infinite' }} />
        <style>{'@keyframes s { to { transform: rotate(360deg) } }'}</style>
      </main>
    )
  }

  if (error === 'bypass') {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0e1420', color: '#6080b0', fontFamily: 'monospace' }}>
        <pre style={{ color: '#b06060' }}>blocked</pre>
      </main>
    )
  }

  if (key) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0e1420', color: '#6080b0', fontFamily: 'monospace' }}>
        <AntiDebug />
        <div style={{ padding: '24px 32px', border: '1px solid #1a2a40' }}>{key}</div>
      </main>
    )
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0e1420', color: '#6080b0', fontFamily: 'monospace' }}>
      <AntiDebug />
      <button
        onClick={() => window.location.href = 'https://linkvertise.com/3037608/GIQY2zNR931p'}
        style={{
          padding: '12px 40px',
          background: '#1a2a40',
          color: '#6080b0',
          border: '1px solid #6080b0',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '0.9em'
        }}
        onMouseEnter={e => { e.target.style.background = '#2a3a55' }}
        onMouseLeave={e => { e.target.style.background = '#1a2a40' }}
      >
        continue
      </button>
    </main>
  )
}
