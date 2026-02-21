import { useEffect } from 'react'
import * as Network from 'expo-network'
import useNetworkStore from '../store/networkStore'

export default function useNetwork() {
  const setOnline = useNetworkStore(s => s.setOnline)

  useEffect(() => {
    let active = true

    const check = async () => {
      const state = await Network.getNetworkStateAsync()
      if (active) setOnline(!!state.isConnected)
    }

    check()
    const id = setInterval(check, 5000)

    return () => {
      active = false
      clearInterval(id)
    }
  }, [])
}
