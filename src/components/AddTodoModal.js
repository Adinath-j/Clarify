import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, Modal, ScrollView,
} from 'react-native'
import { useRef, useState, useEffect, useCallback } from 'react'
import { PRIORITIES, CATEGORIES } from '../utils/constants'
import useTheme from '../hooks/useTheme'

export default function AddTodoModal({
  visible, onClose, onSubmit, initialTitle, initialPriority, initialCategory,
}) {
  const { colors } = useTheme()
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('General')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!visible) return
    setTitle(initialTitle ?? '')
    setPriority(initialPriority ?? 'medium')
    setCategory(initialCategory ?? 'General')
    const t = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [visible, initialTitle, initialPriority, initialCategory])

  const submit = useCallback(() => {
    const trimmed = title.trim()
    if (!trimmed) return
    onSubmit(trimmed, priority, category)
    setTitle('')
    onClose()
  }, [title, priority, category, onSubmit, onClose])

  const canSubmit = title.trim().length > 0

  return (
    <Modal transparent visible={visible} animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <Pressable style={styles.overlay} onPress={() => { if (!title.trim()) onClose() }} />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            {initialTitle ? 'Edit task' : 'New task'}
          </Text>

          <TextInput
            ref={inputRef}
            value={title}
            onChangeText={setTitle}
            placeholder="What do you need to do?"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surfaceAlt }]}
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Priority</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map(({ key, label, color }) => {
              const active = priority === key
              return (
                <Pressable key={key} onPress={() => setPriority(key)} hitSlop={6}
                  style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface },
                    active && { backgroundColor: color, borderColor: color, elevation: 3 }]}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={[styles.chipText, { color: colors.textPrimary },
                    active && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CATEGORIES.map(({ key, label, icon, color }) => {
              const active = category === key
              return (
                <Pressable key={key} onPress={() => setCategory(key)} hitSlop={6}
                  style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface },
                    active && { backgroundColor: color, borderColor: color, elevation: 3 }]}>
                  <Text style={styles.catIcon}>{icon}</Text>
                  <Text style={[styles.chipText, { color: colors.textPrimary },
                    active && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              )
            })}
          </ScrollView>

          <Pressable onPress={submit} disabled={!canSubmit}
            style={[styles.submitButton, { backgroundColor: colors.accent }, !canSubmit && styles.submitDisabled]}>
            <Text style={styles.submitText}>{initialTitle ? 'Update Task' : 'Add Task'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'flex-end' },
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000050' },
  sheet:        { padding: 16, paddingBottom: 32, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  heading:      { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input:        { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
  sectionLabel: { marginTop: 14, marginBottom: 8, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  chipRow:      { flexDirection: 'row', gap: 8, flexWrap: 'nowrap' },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  dot:          { width: 8, height: 8, borderRadius: 4 },
  catIcon:      { fontSize: 13 },
  chipText:     { fontSize: 13, fontWeight: '500' },
  chipTextActive:{ color: '#FFFFFF', fontWeight: '700' },
  submitButton: { marginTop: 18, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  submitDisabled:{ opacity: 0.45 },
  submitText:   { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
})