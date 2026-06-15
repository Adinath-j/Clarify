import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import useTheme from '../hooks/useTheme'
import useUIStore from '../store/uiStore'

const { height } = Dimensions.get('window')

export default function QuickCaptureModal() {
  const { colors, layout } = useTheme()
  const { isQuickCaptureOpen, closeQuickCapture } = useUIStore()
  const router = useRouter()

  const handlePress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    closeQuickCapture()
    
    // Slight delay to allow modal to close smoothly
    setTimeout(() => {
      switch (action) {
        case 'new-note':
          // In a real app, this would trigger the global note modal
          // For now, navigate to notes tab
          router.push('/(tabs)/notes')
          break
        case 'new-task':
          // For now, navigate to home tab (tasks)
          router.push('/(tabs)/inbox')
          break
        case 'ask-ai':
          router.push('/(ai)/ask')
          break
        case 'breakdown':
          router.push('/(ai)/breakdown')
          break
      }
    }, 300)
  }

  const ActionCard = ({ icon, title, subtitle, action }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card }]} 
      onPress={() => handlePress(action)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={isQuickCaptureOpen}
      transparent
      animationType="slide"
      onRequestClose={closeQuickCapture}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeQuickCapture} />
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.title, { color: colors.textPrimary }]}>Quick Capture</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>What would you like to do?</Text>
          
          <View style={styles.cardsContainer}>
            <ActionCard 
              icon="document-text" 
              title="New Note" 
              subtitle="Capture an idea or thought" 
              action="new-note"
            />
            <ActionCard 
              icon="checkmark-circle" 
              title="New Task" 
              subtitle="Create a structured task" 
              action="new-task"
            />
            <ActionCard 
              icon="sparkles" 
              title="Ask AI" 
              subtitle="Search, summarize or understand your data" 
              action="ask-ai"
            />
            <ActionCard 
              icon="git-network" 
              title="Break Down Task" 
              subtitle="Split a large goal into smaller steps" 
              action="breakdown"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 48, // safe area padding
    minHeight: height * 0.55,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
  }
})
