'use client'

import { useEffect } from 'react'

export default function AntiDebug() {
  useEffect(() => {
    let enabled = false
    const enableTimer = setTimeout(() => { enabled = true }, 3000)

    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')
      ) {
        e.preventDefault()
        return false
      }
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    const checkDevTools = () => {
      if (!enabled) return
      const threshold = 200
      const widthDiff = window.outerWidth - window.innerWidth
      const heightDiff = window.outerHeight - window.innerHeight
      if (widthDiff > threshold || heightDiff > threshold) {
        document.cookie = 'k_bypass=true; path=/; max-age=1800'
        window.location.reload()
      }
    }

    const consoleCheck = setInterval(() => {
      if (!enabled) return
      try {
        if (!Function.prototype.toString.call(console.log).includes('native code')) {
          document.cookie = 'k_bypass=true; path=/; max-age=1800'
          window.location.reload()
        }
      } catch (e) {}
    }, 2000)

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    const devToolsInterval = setInterval(checkDevTools, 2000)

    return () => {
      clearTimeout(enableTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      clearInterval(devToolsInterval)
      clearInterval(consoleCheck)
    }
  }, [])

  return null
}
