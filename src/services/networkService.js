/**
 * networkService.js
 * Wraps expo-network to expose a clean reconnect detection API.
 *
 * This module is consumed by useNetwork.js to fire syncService.triggerSync()
 * exactly once per online→offline→online transition.
 */
import * as Network from 'expo-network'

let _onReconnectCallback = null
let _lastKnownState      = true  // assume online at startup

/**
 * Register a callback to be called when the device transitions from
 * offline → online. The callback fires at most once per transition.
 *
 * @param {Function} callback
 */
export function onReconnect(callback) {
  _onReconnectCallback = callback
}

/**
 * Polls the network state and fires the reconnect callback when appropriate.
 * Called by useNetwork every 5 seconds.
 */
export async function checkAndNotify() {
  try {
    const state     = await Network.getNetworkStateAsync()
    const isOnline  = !!(state.isConnected && state.isInternetReachable !== false)

    if (!_lastKnownState && isOnline) {
      // Transitioned offline → online
      console.log('[NetworkService] Reconnected — triggering sync.')
      _onReconnectCallback?.()
    }

    _lastKnownState = isOnline
    return isOnline
  } catch {
    return _lastKnownState
  }
}

/**
 * One-shot check — returns current online state without side-effects.
 */
export async function getIsOnline() {
  try {
    const state = await Network.getNetworkStateAsync()
    return !!(state.isConnected && state.isInternetReachable !== false)
  } catch {
    return true
  }
}
