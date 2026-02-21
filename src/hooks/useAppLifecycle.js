import { useEffect } from 'react'
import { AppState } from 'react-native'

export default function useAppLifecycle() {
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background') {
        // stop sync, timers, listeners
      }

      if (state === 'active') {
        // resume minimal sync
      }
    })

    return () => sub.remove()
  }, [])
}
