import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Keyboard } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import useTheme from '../../hooks/useTheme'
import useTodoStore from '../../store/todoStore'
import { getDateKey } from '../../utils/date'
import { breakDownTask } from '../../services/aiService'

export default function BreakdownScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const { addTodo } = useTodoStore()
  
  const [taskPrompt, setTaskPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [steps, setSteps] = useState([])
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = async () => {
    if (!taskPrompt.trim()) return
    Keyboard.dismiss()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsGenerating(true)
    setSteps([])
    
    try {
      const generatedTasks = await breakDownTask(taskPrompt)
      // Map strings to objects
      const newSteps = generatedTasks.map((title, i) => ({
        id: String(i),
        title,
        selected: true // default to true
      }))
      setSteps(newSteps)
      setHasGenerated(true)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (err) {
      console.warn('Breakdown failed:', err)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleStep = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSteps(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s))
  }

  const handleAddAll = () => {
    const selectedSteps = steps.filter(s => s.selected)
    if (selectedSteps.length === 0) return

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const dateKey = getDateKey(new Date())
    
    selectedSteps.forEach(step => {
      addTodo({ title: step.title, priority: 'medium', category: 'General', dateKey })
    })
    
    router.replace('/')
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Break down a task</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Turn any large goal into manageable steps using AI.</Text>

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="e.g. Build a personal portfolio website"
            placeholderTextColor={colors.textSecondary}
            value={taskPrompt}
            onChangeText={setTaskPrompt}
            onSubmitEditing={handleGenerate}
            returnKeyType="go"
            editable={!isGenerating}
            multiline
          />
        </View>

        {!hasGenerated && !isGenerating && (
          <TouchableOpacity 
            style={[styles.generateBtn, { backgroundColor: taskPrompt ? colors.primary : colors.surface }]}
            onPress={handleGenerate}
            disabled={!taskPrompt.trim()}
          >
            <Ionicons name="sparkles" size={20} color={taskPrompt ? '#fff' : colors.textSecondary} />
            <Text style={[styles.generateBtnText, { color: taskPrompt ? '#fff' : colors.textSecondary }]}>Generate Steps</Text>
          </TouchableOpacity>
        )}

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Thinking...</Text>
          </View>
        )}

        {hasGenerated && steps.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Review breakdown</Text>

            <View style={styles.list}>
              {steps.map((step) => (
                <TouchableOpacity 
                  key={step.id} 
                  style={[styles.stepItem, { borderBottomColor: colors.border }]}
                  onPress={() => toggleStep(step.id)}
                >
                  <View style={styles.stepText}>
                    <Text style={[styles.stepTitle, { color: colors.textPrimary, textDecorationLine: step.selected ? 'none' : 'line-through', opacity: step.selected ? 1 : 0.5 }]}>{step.title}</Text>
                  </View>
                  <Ionicons 
                    name={step.selected ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={step.selected ? colors.primary : colors.textSecondary} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Floating Bottom Button */}
      {hasGenerated && steps.some(s => s.selected) && (
        <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddAll}>
            <LinearGradient
              colors={['#6366f1', '#a855f7']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.addBtnGradient}
            >
              <Text style={styles.addBtnText}>Add All to Tasks</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 24, alignItems: 'flex-end' },
  backBtn: { padding: 4 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  
  inputContainer: {
    padding: 16, borderRadius: 16, borderWidth: 1,
    minHeight: 100, marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  input: { flex: 1, fontSize: 18, textAlignVertical: 'top' },
  
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 16, gap: 8
  },
  generateBtnText: { fontSize: 16, fontWeight: '600' },
  
  loadingContainer: { alignItems: 'center', padding: 40, gap: 16 },
  loadingText: { fontSize: 16, fontWeight: '500' },

  sectionTitle: { fontSize: 14, fontWeight: '500', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  list: { gap: 0 },
  stepItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1
  },
  stepText: { flex: 1, marginRight: 16 },
  stepTitle: { fontSize: 16, fontWeight: '500' },
  
  bottomContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: 'transparent'
  },
  addBtn: { borderRadius: 16, overflow: 'hidden' },
  addBtnGradient: { padding: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
})
