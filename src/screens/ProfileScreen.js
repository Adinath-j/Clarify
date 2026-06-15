import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import useAuthStore from '../store/authStore'
import useAnimatedTheme from '../hooks/useAnimatedTheme'
import useUIStore from '../store/uiStore'
import useTodoStore from '../store/todoStore'
import useNotesStore from '../store/notesStore'
import { calculateStreak } from '../utils/streak'
import SegmentedFilter from '../components/SegmentedFilter'
import useNetworkStore from '../store/networkStore'
import { triggerSync } from '../services/syncService'
import { SYNC_STATUS } from '../utils/constants'

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

export default function ProfileScreen() {
  const { animatedStyles, staticColors: colors, layout, typography } = useAnimatedTheme()
  const { user, logout, isGuest } = useAuthStore()
  const { themeMode, setThemeMode, setHasSeenWalkthrough, syncStatus, lastSyncedAt } = useUIStore()
  const todos = useTodoStore(s => s.todos)
  const notes = useNotesStore(s => s.notes)
  const isOnline = useNetworkStore(s => s.isOnline)

  const formatLastSynced = (iso) => {
    if (!iso) return 'Never'
    const date = new Date(iso)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    return isToday ? `Today • ${time}` : `${date.toLocaleDateString()} • ${time}`
  }

  const name = isGuest ? 'Guest User' : (user?.user_metadata?.full_name || 'User')
  const email = isGuest ? 'Offline Mode' : (user?.email || 'user@example.com')
  const completedTasksCount = todos.filter(t => t.completed && !t.deleted).length
  const notesCount = notes.filter(n => !n.deleted).length
  const streak = calculateStreak(todos)
  const focusScore = todos.length > 0 ? Math.round((completedTasksCount / todos.length) * 100) : 0

  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

  const NavItem = ({ icon, title, isDanger, onPress }) => (
    <AnimatedTouchableOpacity style={[styles.navItem, { borderBottomWidth: 1 }, animatedStyles.border]} onPress={onPress}>
      <View style={styles.navItemLeft}>
        <Ionicons name={icon} size={20} color={isDanger ? colors.error : colors.textSecondary} />
        <Animated.Text style={[typography.bodyM, isDanger ? animatedStyles.textErrorColor : animatedStyles.textPrimary]}>{title}</Animated.Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </AnimatedTouchableOpacity>
  )

  const themeOptions = ['light', 'system', 'dark']
  const themeLabels = { light: 'Light', system: 'System', dark: 'Dark' }
  const displayThemeMode = themeLabels[themeMode] || 'System'

  return (
    <AnimatedSafeAreaView style={[styles.container, animatedStyles.bgBackground]} edges={['top']}>
      <Animated.View style={[styles.header, { paddingHorizontal: layout.spacing.xl, paddingVertical: layout.spacing.md }]}>
        <Animated.Text style={[typography.headingM, animatedStyles.textPrimary]}>Profile</Animated.Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: layout.spacing.xl, paddingBottom: 100 }]}>
        {/* User Card */}
        <Animated.View style={styles.userSection}>
          <Animated.View style={[styles.avatarContainer, animatedStyles.borderPrimary]}>
            <Image 
              source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?img=11' }} 
              style={styles.avatar} 
            />
          </Animated.View>
          <Animated.View style={styles.userInfo}>
            <Animated.Text style={[typography.headingL, animatedStyles.textPrimary, { marginBottom: layout.spacing.xs }]}>{name}</Animated.Text>
            <Animated.Text style={[typography.bodyS, animatedStyles.textSecondary, { marginBottom: layout.spacing.sm }]}>{email}</Animated.Text>
            {!isGuest && (
              <Animated.View style={[styles.proBadge, animatedStyles.bgSurface, { borderRadius: layout.radius.md }]}>
                <Animated.Text style={[typography.caption, animatedStyles.textPrimaryColor]}>Pro Plan</Animated.Text>
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>

        {/* Theme Switcher */}
        <Animated.View style={{ marginBottom: layout.spacing.xl }}>
          <Animated.Text style={[typography.bodyS, animatedStyles.textSecondary, { marginBottom: layout.spacing.sm, marginLeft: layout.spacing.xs }]}>APPEARANCE</Animated.Text>
          <SegmentedFilter 
            options={['Light', 'System', 'Dark']} 
            selectedOption={displayThemeMode}
            onSelect={(val) => {
              setTimeout(() => setThemeMode(val.toLowerCase()), 150)
            }}
          />
        </Animated.View>

        {/* Stats Section */}
        <Animated.View style={[styles.card, animatedStyles.bgCard, animatedStyles.border]}>
          <View style={styles.cardHeader}>
            <Animated.Text style={[styles.cardTitle, animatedStyles.textPrimary]}>Your Stats</Animated.Text>
            <TouchableOpacity><Text style={[styles.viewAllBtn, { color: colors.primary }]}>View All</Text></TouchableOpacity>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
              <Animated.Text style={[styles.statLabel, animatedStyles.textSecondary]}>Tasks Completed</Animated.Text>
            </View>
            <Animated.Text style={[styles.statValue, animatedStyles.textPrimary]}>{completedTasksCount}</Animated.Text>
          </View>
          
          <Animated.View style={[styles.divider, animatedStyles.bgBorder]} />
          
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Animated.Text style={[styles.statLabel, animatedStyles.textSecondary]}>Notes Created</Animated.Text>
            </View>
            <Animated.Text style={[styles.statValue, animatedStyles.textPrimary]}>{notesCount}</Animated.Text>
          </View>
          
          <Animated.View style={[styles.divider, animatedStyles.bgBorder]} />
          
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="flame-outline" size={20} color={colors.warning} />
              <Animated.Text style={[styles.statLabel, animatedStyles.textSecondary]}>Day Streak</Animated.Text>
            </View>
            <Animated.Text style={[styles.statValue, animatedStyles.textPrimary]}>{streak} days</Animated.Text>
          </View>

          <Animated.View style={[styles.divider, animatedStyles.bgBorder]} />

          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="flash-outline" size={20} color={colors.primary} />
              <Animated.Text style={[styles.statLabel, animatedStyles.textSecondary]}>Focus Score</Animated.Text>
            </View>
            <Animated.Text style={[styles.statValue, animatedStyles.textPrimary]}>{focusScore}%</Animated.Text>
          </View>
        </Animated.View>

        {/* Cloud Sync Section */}
        {!isGuest && (
          <Animated.View style={[styles.card, animatedStyles.bgCard, animatedStyles.border]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Cloud Sync</Text>
              <TouchableOpacity onPress={triggerSync} disabled={syncStatus === SYNC_STATUS.SYNCING}>
                <Ionicons name="sync" size={20} color={colors.primary} style={syncStatus === SYNC_STATUS.SYNCING ? { opacity: 0.5 } : {}} />
              </TouchableOpacity>
            </View>

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statValue, { color: isOnline ? (colors.dark ? '#4ADE80' : '#0F5132') : (colors.dark ? '#FDE68A' : '#664D03') }]}>
                {isOnline ? '✓ Connected' : '☁️ Offline'}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Last Synced</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatLastSynced(lastSyncedAt)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Auto Sync</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>Enabled</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Offline Mode</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>Supported</Text>
            </View>
          </Animated.View>
        )}

        {/* Links Section */}
        <Animated.View style={[styles.card, animatedStyles.bgCard, animatedStyles.border, { padding: 0 }]}>
          <NavItem icon="analytics-outline" title="Insights & Analytics" />
          <NavItem icon="calendar-outline" title="Calendar" />
          <NavItem icon="notifications-outline" title="Reminders" />
          <NavItem icon="settings-outline" title="Settings" />
          <NavItem icon="help-circle-outline" title="Help & Support" />
          <NavItem icon="refresh-outline" title="Reset Walkthrough" onPress={() => setHasSeenWalkthrough(false)} />
          <NavItem icon="log-out-outline" title="Sign Out" isDanger onPress={logout} />
        </Animated.View>

      </ScrollView>
    </AnimatedSafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 180 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontSize: 14, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  
  userSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  avatarContainer: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, padding: 2, marginRight: 16 },
  avatar: { width: '100%', height: '100%', borderRadius: 36 },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 8 },
  proBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  proBadgeText: { fontSize: 11, fontWeight: '700' },
  settingsBtn: { padding: 8 },

  card: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  viewAllBtn: { fontSize: 13, fontWeight: '600' },
  
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },

  navItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  navItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navItemText: { fontSize: 15, fontWeight: '500' }
})