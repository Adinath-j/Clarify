import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import useAuthStore from '../store/authStore'
import useTheme from '../hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'

export default function WelcomeScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const { setGuestMode } = useAuthStore()

  const handleContinueOffline = async () => {
    await setGuestMode()
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="flash" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Clarify</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your intelligent productivity workspace. Tasks, notes, and AI insights in one place.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => router.push('/login')}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.textSecondary }]}>OR</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity 
          style={[styles.guestButton, { borderColor: colors.border }]}
          onPress={handleContinueOffline}
        >
          <Ionicons name="cloud-offline-outline" size={20} color={colors.text} />
          <Text style={[styles.guestButtonText, { color: colors.text }]}>Continue as Anonymous</Text>
        </TouchableOpacity>
        <Text style={[styles.guestNote, { color: colors.textSecondary }]}>
          No account needed. Cloud sync and AI features will be disabled.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  guestNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: -8,
  }
})
