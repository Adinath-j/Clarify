import React from 'react'
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import useAuthStore from '../store/authStore'
import useTheme from '../hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function ProfileScreen() {
  const { colors } = useTheme()
  const { logout, user, isGuest } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    Alert.alert(
      isGuest ? "Sign In" : "Sign Out",
      isGuest 
        ? "Signing in enables cloud sync and AI features across all your devices."
        : "Are you sure you want to sign out? Your local tasks and notes will be preserved.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: isGuest ? "Continue to Sign In" : "Sign Out", 
          style: isGuest ? "default" : "destructive", 
          onPress: async () => {
            await logout()
          }
        }
      ]
    )
  }

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {children}
      </View>
    </View>
  )

  const Row = ({ icon, label, destructive, onPress, badge }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={24} color={destructive ? '#ff4444' : colors.text} />
        <Text style={[styles.rowLabel, { color: destructive ? '#ff4444' : colors.text }]}>{label}</Text>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badge.color }]}>
            <Text style={styles.badgeText}>{badge.text}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  )

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{isGuest ? 'G' : (user?.email?.[0]?.toUpperCase() || 'U')}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{isGuest ? 'Guest User' : (user?.user_metadata?.full_name || 'Clarify User')}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{isGuest ? 'Offline Mode' : user?.email}</Text>
        
        <View style={styles.metaInfo}>
          <View style={[styles.badge, { backgroundColor: isGuest ? '#607D8B' : colors.primary, marginTop: 8 }]}>
            <Text style={styles.badgeText}>{isGuest ? 'GUEST ACCOUNT' : 'AUTHENTICATED'}</Text>
          </View>
          <Text style={[styles.metaText, { color: colors.textSecondary, marginTop: 8 }]}>
            ID: {user?.id?.substring(0, 8)}... • Created: {new Date(user?.createdAt || user?.created_at || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Section title="Account & Data">
        <Row 
          icon="settings-outline" 
          label="Account Settings" 
          onPress={() => router.push('/account-settings')}
        />
        <Row 
          icon="cloud-done-outline" 
          label="Sync Status" 
          badge={isGuest ? { text: 'Disabled', color: '#ff4444' } : { text: 'Active', color: '#4CAF50' }}
        />
        <Row 
          icon="save-outline" 
          label="Local Backup" 
          badge={{ text: 'Ready', color: colors.primary }}
        />
      </Section>

      <Section title="Features">
        <Row 
          icon="sparkles-outline" 
          label="AI Features" 
          badge={isGuest ? { text: 'Offline', color: '#ff4444' } : { text: 'Enabled', color: '#4CAF50' }}
        />
        <Row 
          icon="bar-chart-outline" 
          label="Productivity Stats" 
        />
      </Section>

      <Section title="Danger Zone">
        <Row 
          icon={isGuest ? "log-in-outline" : "log-out-outline"} 
          label={isGuest ? "Sign In & Sync" : "Sign Out"} 
          destructive={!isGuest} 
          onPress={handleLogout}
        />
        {!isGuest && (
          <Row icon="trash-outline" label="Delete Account" destructive />
        )}
      </Section>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginVertical: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14 },
  metaInfo: { alignItems: 'center', marginTop: 8 },
  metaText: { fontSize: 12 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
  card: { borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }
})