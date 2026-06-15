/**
 * SyncStatusBar.js
 * A floating, non-intrusive status indicator.
 */
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useNetworkStore from '../store/networkStore'
import useUIStore      from '../store/uiStore'
import useAuthStore    from '../store/authStore'
import { triggerSync } from '../services/syncService'
import { SYNC_STATUS }  from '../utils/constants'
import useTheme from '../hooks/useTheme'

export default function SyncStatusBar() {
  const isOnline   = useNetworkStore((s) => s.isOnline)
  const syncStatus = useUIStore((s) => s.syncStatus)
  const setSyncStatus = useUIStore((s) => s.setSyncStatus)
  const isGuest    = useAuthStore((s) => s.isGuest)
  const { colors, layout, dark } = useTheme()
  const insets = useSafeAreaInsets()

  // State for chip and snackbar visibility
  const [showChip, setShowChip] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)

  // Reanimated values
  const chipOpacity = useSharedValue(0)
  const chipScale = useSharedValue(0.9)
  const snackbarOpacity = useSharedValue(0)
  const snackbarTranslateY = useSharedValue(20)

  // Determine what to show
  const isOffline = !isOnline
  const isSyncing = isOnline && syncStatus === SYNC_STATUS.SYNCING
  const isSuccess = isOnline && syncStatus === SYNC_STATUS.SUCCESS
  const isError   = isOnline && syncStatus === SYNC_STATUS.ERROR

  // Effect to handle chip visibility and transitions
  useEffect(() => {
    let timeout;
    if (isOffline || isSyncing || isSuccess) {
      setShowChip(true)
      chipOpacity.value = withTiming(1, { duration: 200 })
      chipScale.value = withSpring(1, { damping: 15, stiffness: 200 })

      if (isSuccess) {
        // Auto-hide success state after 1.2s
        timeout = setTimeout(() => {
          chipOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
            if (finished) {
              runOnJS(setShowChip)(false)
              runOnJS(setSyncStatus)(SYNC_STATUS.IDLE)
            }
          })
        }, 1200)
      }
    } else {
      chipOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) runOnJS(setShowChip)(false)
      })
    }
    return () => clearTimeout(timeout)
  }, [isOffline, isSyncing, isSuccess])

  // Effect to handle error snackbar
  useEffect(() => {
    let timeout;
    if (isError) {
      setShowSnackbar(true)
      snackbarOpacity.value = withTiming(1, { duration: 200 })
      snackbarTranslateY.value = withSpring(0, { damping: 15, stiffness: 200 })

      // Auto-dismiss error snackbar after 6 seconds
      timeout = setTimeout(() => {
        dismissSnackbar()
      }, 6000)
    } else {
      dismissSnackbar()
    }
    return () => clearTimeout(timeout)
  }, [isError])

  const dismissSnackbar = () => {
    snackbarOpacity.value = withTiming(0, { duration: 200 })
    snackbarTranslateY.value = withTiming(20, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setShowSnackbar)(false)
        if (syncStatus === SYNC_STATUS.ERROR) runOnJS(setSyncStatus)(SYNC_STATUS.IDLE)
      }
    })
  }

  const chipStyle = useAnimatedStyle(() => ({
    opacity: chipOpacity.value,
    transform: [{ scale: chipScale.value }]
  }))

  const snackbarStyle = useAnimatedStyle(() => ({
    opacity: snackbarOpacity.value,
    transform: [{ translateY: snackbarTranslateY.value }]
  }))

  if (isGuest) return null

  // --- Render Chip ---
  let chipBg = colors.surface
  let chipText = ''
  let chipIcon = null

  if (isOffline) {
    chipBg = dark ? '#2A2416' : '#FFF3CD'
    chipText = 'Offline'
    chipIcon = <Text style={{ fontSize: 12 }}>☁️</Text>
  } else if (isSyncing) {
    chipText = 'Syncing…'
    chipIcon = <ActivityIndicator size="small" color={colors.primary} style={{ transform: [{ scale: 0.7 }] }} />
  } else if (isSuccess) {
    chipBg = dark ? '#132A1D' : '#D1E7DD'
    chipText = 'Synced'
    chipIcon = <Ionicons name="checkmark" size={14} color={dark ? '#4ADE80' : '#0F5132'} />
  }

  return (
    <>
      {/* Floating Top-Right Chip */}
      {showChip && (
        <Animated.View style={[
          styles.chip,
          { top: Math.max(insets.top + 8, 16), backgroundColor: chipBg, borderColor: colors.border },
          chipStyle
        ]}>
          {chipIcon}
          <Text style={[styles.chipText, { color: isOffline ? (dark ? '#FDE68A' : '#664D03') : (isSuccess ? (dark ? '#4ADE80' : '#0F5132') : colors.primary) }]}>
            {chipText}
          </Text>
        </Animated.View>
      )}

      {/* Floating Bottom Snackbar */}
      {showSnackbar && (
        <Animated.View style={[
          styles.snackbar,
          { bottom: Math.max(insets.bottom + 80, 96), backgroundColor: dark ? '#2A1616' : '#F8D7DA', borderColor: dark ? '#451A1A' : '#F5C2C7' },
          snackbarStyle
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="alert-circle" size={18} color={dark ? '#F87171' : '#842029'} style={{ marginRight: 8 }} />
            <Text style={[styles.snackbarText, { color: dark ? '#F87171' : '#842029' }]}>Sync failed</Text>
          </View>
          <Pressable onPress={() => { dismissSnackbar(); triggerSync(); }} style={[styles.retryBtn, { backgroundColor: dark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(132, 32, 41, 0.1)' }]}>
            <Text style={[styles.retryText, { color: dark ? '#F87171' : '#842029' }]}>Retry</Text>
          </Pressable>
        </Animated.View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    gap: 6
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  snackbarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
  },
})
