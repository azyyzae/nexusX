'use client'

import { useEffect } from 'react'

export default function AntiDebug() {
  useEffect(() => {
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

    let devtoolsOpen = false

    const checkDevTools = () => {
      const threshold = 160
      const widthDiff = window.outerWidth - window.innerWidth
      const heightDiff = window.outerHeight - window.innerHeight
      if (widthDiff > threshold || heightDiff > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true
          document.cookie = 'k_bypass=true; path=/; max-age=1800'
          window.location.href = '/key?error=bypass'
        }
      } else {
        devtoolsOpen = false
      }
    }

    const debuggerInterval = setInterval(() => {
      const start = performance.now()
      debugger
      const end = performance.now()
      if (end - start > 100) {
        document.cookie = 'k_bypass=true; path=/; max-age=1800'
        window.location.href = '/key?error=bypass'
      }
    }, 500)

    const consoleCheck = setInterval(() => {
      if (!console.log.toString().includes('[native code]')) {
        document.cookie = 'k_bypass=true; path=/; max-age=1800'
        window.location.href = '/key?error=bypass'
      }
    }, 1000)

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    const devToolsInterval = setInterval(checkDevTools, 1000)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      clearInterval(debuggerInterval)
      clearInterval(devToolsInterval)
      clearInterval(consoleCheck)
    }
  }, [])

  return null
}
