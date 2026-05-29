/**
 * SyncStatusBar.js
 * A slim status indicator rendered above the tab content.
 *
 * States:
 *   offline  → amber banner: "No internet connection"
 *   syncing  → blue banner: "Syncing…" with spinner
 *   success  → green flash: "Synced" (auto-hides after 3s)
 *   error    → red banner: "Sync failed · Retry" with retry button
 *   idle     → hidden (renders null)
 */
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import useNetworkStore from '../store/networkStore'
import useUIStore      from '../store/uiStore'
import { triggerSync } from '../services/syncService'
import { SYNC_STATUS }  from '../utils/constants'

export default function SyncStatusBar() {
  const isOnline   = useNetworkStore((s) => s.isOnline)
  const syncStatus = useUIStore((s) => s.syncStatus)
  const syncError  = useUIStore((s) => s.syncError)

  const opacity = useRef(new Animated.Value(0)).current

  // Determine what (if anything) to show
  const showOffline  = !isOnline
  const showSyncing  = isOnline && syncStatus === SYNC_STATUS.SYNCING
  const showSuccess  = isOnline && syncStatus === SYNC_STATUS.SUCCESS
  const showError    = isOnline && syncStatus === SYNC_STATUS.ERROR
  const visible      = showOffline || showSyncing || showSuccess || showError

  useEffect(() => {
    Animated.timing(opacity, {
      toValue:  visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }, [visible])

  if (!visible && opacity._value === 0) return null

  let bgColor = '#F59E0B'    // default: offline amber
  let message = 'No internet connection'
  let icon    = 'cloud-offline-outline'

  if (showSyncing) {
    bgColor = '#2563EB'
    message = 'Syncing…'
    icon    = null            // spinner replaces icon
  } else if (showSuccess) {
    bgColor = '#16A34A'
    message = 'Synced'
    icon    = 'checkmark-circle-outline'
  } else if (showError) {
    bgColor = '#DC2626'
    message = 'Sync failed'
    icon    = 'alert-circle-outline'
  }

  return (
    <Animated.View style={[styles.bar, { backgroundColor: bgColor, opacity }]}>
      {showSyncing ? (
        <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
      ) : (
        <Ionicons name={icon} size={14} color="#FFFFFF" style={styles.icon} />
      )}

      <Text style={styles.text}>{message}</Text>

      {showError && (
        <Pressable onPress={triggerSync} hitSlop={8} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 6,
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    color:      '#FFFFFF',
    fontSize:   12,
    fontWeight: '600',
  },
  retryBtn: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF80',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  retryText: {
    color:      '#FFFFFF',
    fontSize:   11,
    fontWeight: '700',
  },
})
