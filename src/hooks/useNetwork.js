/**
 * useNetwork.js
 * Polls network state every 5 seconds.
 * Fires syncService.triggerSync() on reconnect.
 */
import { useEffect } from 'react'
import useNetworkStore from '../store/networkStore'
import { checkAndNotify, onReconnect } from '../services/networkService'
import { triggerSync } from '../services/syncService'

export default function useNetwork() {
  const setOnline = useNetworkStore((s) => s.setOnline)

  useEffect(() => {
    let active = true

    // Register sync trigger on reconnect
    onReconnect(() => {
      if (active) {
        console.log('[useNetwork] Reconnected → triggering sync')
        triggerSync()
      }
    })

    const check = async () => {
      if (!active) return
      const isOnline = await checkAndNotify()
      if (active) setOnline(isOnline)
    }

    check()
    const id = setInterval(check, 5000)

    return () => {
      active = false
      clearInterval(id)
    }
  }, [])
}
