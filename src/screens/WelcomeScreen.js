import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import useAuthStore from '../store/authStore'
import useAnimatedTheme from '../hooks/useAnimatedTheme'

const { width } = Dimensions.get('window')

export default function WelcomeScreen() {
  const { animatedStyles, staticColors: colors, layout, typography } = useAnimatedTheme()
  const router = useRouter()
  const { setGuestMode } = useAuthStore()

  const handleContinueOffline = async () => {
    await setGuestMode()
  }

  // A standalone abstract graphic imitating the glassmorphic cards in the mockup
  const AbstractHeroGraphic = () => (
    <View style={styles.graphicContainer}>
      <View style={[styles.graphicCardBack, { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }]} />
      <View style={[styles.graphicCardMid, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]} />
      <LinearGradient
        colors={['rgba(90, 40, 240, 0.4)', 'rgba(20, 10, 60, 0.8)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.graphicCardFront}
      >
        <Ionicons name="sparkles" size={48} color="#FFFFFF" style={{ opacity: 0.9 }} />
        <View style={styles.graphicBar} />
      </LinearGradient>
      {/* Decorative stars */}
      <Ionicons name="star" size={8} color={colors.primary} style={[styles.decoStar, { top: -10, left: 20 }]} />
      <Ionicons name="star" size={6} color={colors.primary} style={[styles.decoStar, { bottom: 20, right: -10 }]} />
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: '#05050A' }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>

          {/* Header Logo */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#1A162B', '#0B0A12']}
              style={styles.logoBadge}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.logoText, { color: '#FFFFFF' }]}>Clarify</Text>
          </View>

          {/* Hero Section */}
          <View style={styles.heroRow}>
            <View style={styles.heroTextContainer}>
              <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Your mind{'\n'}deserves{'\n'}<Text style={{ color: '#7C3AED' }}>clarity.</Text></Text>
              <Text style={[styles.heroSubtitle, { color: '#9CA3AF' }]}>
                Tasks. Notes. Insights.{'\n'}One intelligent workspace.
              </Text>
            </View>
            <AbstractHeroGraphic />
          </View>



          {/* Features Row */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Ionicons name="wifi" size={16} color="#6B7280" />
              <Text style={styles.featureText}>Works Offline</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="lock-closed-outline" size={16} color="#6B7280" />
              <Text style={styles.featureText}>Private by Default</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="sparkles-outline" size={16} color="#7C3AED" />
              <Text style={styles.featureText}>AI-Powered{'\n'}Insights</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="cloud-outline" size={16} color="#6B7280" />
              <Text style={styles.featureText}>Cloud Sync{'\n'}Optional</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => { handleContinueOffline() }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Continue as Guest</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={{ position: 'absolute', right: 20 }} />
              </LinearGradient>
            </Pressable>

            <Text style={styles.disclaimerText}>
              No signup required. Start using Clarify instantly.
            </Text>

            <View style={styles.secondaryBtnRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/login')}>
                <Ionicons name="person-outline" size={18} color="#D1D5DB" />
                <Text style={styles.secondaryBtnText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/signup')}>
                <Ionicons name="person-add-outline" size={18} color="#D1D5DB" />
                <Text style={styles.secondaryBtnText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, gap: 10 },
  logoBadge: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '700' },

  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  heroTextContainer: { flex: 0.6 },
  heroTitle: { fontSize: 42, fontWeight: '800', lineHeight: 46, letterSpacing: -1 },
  heroSubtitle: { fontSize: 14, marginTop: 16, lineHeight: 22 },

  // Abstract Graphic
  graphicContainer: { flex: 0.4, height: 160, position: 'relative', alignItems: 'flex-end', justifyContent: 'center' },
  graphicCardBack: { position: 'absolute', width: 100, height: 120, borderRadius: 16, borderWidth: 1, right: 10, top: 10, transform: [{ rotateZ: '5deg' }] },
  graphicCardMid: { position: 'absolute', width: 110, height: 130, borderRadius: 16, borderWidth: 1, right: 15, top: 15, transform: [{ rotateZ: '0deg' }] },
  graphicCardFront: { position: 'absolute', width: 120, height: 140, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.4)', right: 20, top: 20, transform: [{ rotateZ: '-5deg' }], justifyContent: 'center', alignItems: 'center' },
  graphicBar: { width: 60, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', position: 'absolute', bottom: 20 },
  decoStar: { position: 'absolute' },

  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, paddingHorizontal: 10 },
  featureItem: { alignItems: 'center', flex: 1, gap: 8 },
  featureDivider: { width: 1, height: 20, backgroundColor: '#374151' },
  featureText: { color: '#9CA3AF', fontSize: 10, textAlign: 'center', lineHeight: 14 },

  actions: { gap: 16 },
  primaryBtn: { borderRadius: 16, overflow: 'hidden' },
  primaryBtnGradient: { padding: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  disclaimerText: { color: '#6B7280', fontSize: 12, textAlign: 'center', marginBottom: 8 },

  secondaryBtnRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#374151', backgroundColor: '#111118' },
  secondaryBtnText: { color: '#D1D5DB', fontSize: 14, fontWeight: '600' }
})
