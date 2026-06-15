import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native'
import { useRef, useState, useEffect, useCallback } from 'react'
import useTheme from '../hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { runAITool } from '../services/aiService'

export default function AddNoteModal({ visible, onClose, onSubmit, initialTitle, initialBody }) {
  const { colors } = useTheme()
  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    if (!visible) return
    setTitle(initialTitle ?? '')
    setBody(initialBody ?? '')
    const t = setTimeout(() => titleRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [visible, initialTitle, initialBody])

  const submit = useCallback(() => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    onSubmit({ title: trimmedTitle, body: body.trim() })
    setTitle('')
    setBody('')
    onClose()
  }, [title, body, onSubmit, onClose])

  const canSubmit = title.trim().length > 0

  return (
    <Modal transparent visible={visible} animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.background + 'A0' }]} onPress={() => { if (!title.trim() && !body.trim()) onClose() }} />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          
          <View style={styles.headerRow}>
            <Text style={[styles.heading, { color: colors.textPrimary }]}>
              {initialTitle ? 'Edit note' : 'New note'}
            </Text>
            
            <View style={styles.headerActions}>
              <Pressable 
                style={[styles.aiBtn, { backgroundColor: isAILoading ? colors.surfaceContainer : colors.primary + '15' }]}
                onPress={async () => {
                  if (isAILoading || !body.trim()) return
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setIsAILoading(true)
                  try {
                    // Summarize or Generate Title based on state
                    if (!title.trim() && body.trim()) {
                      const res = await runAITool({ tool: 'title', prompt: body })
                      if (res?.title) setTitle(res.title)
                    } else {
                      const res = await runAITool({ tool: 'summarize', prompt: body })
                      if (res?.summary) setBody(prev => prev + '\n\n---\n**AI Summary:**\n' + res.summary)
                    }
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                  } catch (err) {
                    console.warn(err)
                  } finally {
                    setIsAILoading(false)
                  }
                }}
              >
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={[styles.aiBtnText, { color: colors.primary }]}>
                  {isAILoading ? 'Thinking...' : (!title.trim() && body.trim() ? 'Generate Title' : 'AI ✨')}
                </Text>
              </Pressable>
            </View>
          </View>

          <TextInput
            ref={titleRef}
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            style={[styles.titleInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.card }]}
            returnKeyType="next"
          />

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Add note content…"
            placeholderTextColor={colors.textSecondary}
            style={[styles.bodyInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.card }]}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={[styles.cancelButton, { borderColor: colors.border }]}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} disabled={!canSubmit}
              style={[styles.submitButton, { backgroundColor: colors.primary }, !canSubmit && styles.submitDisabled]}>
              <Text style={[styles.submitText, { color: colors.card }]}>{initialTitle ? 'Save changes' : 'Add Note'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'flex-end' },
  overlay:      { ...StyleSheet.absoluteFillObject },
  sheet:        { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  heading:      { fontSize: 18, fontWeight: '700' },
  headerActions:{ flexDirection: 'row', gap: 8 },
  aiBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  aiBtnText:    { fontSize: 13, fontWeight: '600' },
  titleInput:   { fontSize: 16, fontWeight: '600', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  bodyInput:    { fontSize: 15, borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 100, marginBottom: 16 },
  footer:       { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelText:   { fontWeight: '600', fontSize: 15 },
  submitButton: { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  submitDisabled:{ opacity: 0.45 },
  submitText:   { fontWeight: '700', fontSize: 15 },
})
