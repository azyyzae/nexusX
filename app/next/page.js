'use client'

import { useEffect } from 'react'

export default function NextPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      window.location.href = '/key?error=invalid_token'
      return
    }

    fetch('/api/verify-next', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(r => r.json())
      .then(data => {
        window.location.href = data.redirect || '/key?error=bypass'
      })
      .catch(() => {
        window.location.href = '/key?error=error'
      })
  }, [])

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0e1420', color: '#6080b0', fontFamily: 'monospace' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid #1a2a40', borderTop: '2px solid #6080b0', borderRadius: '50%', animation: 's 1s linear infinite' }} />
      <style>{`@keyframes s { to { transform: rotate(360deg) } }`}</style>
    </main>
  )
}
