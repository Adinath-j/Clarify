import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native'
import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * AddNoteModal — bottom sheet modal for creating or editing a note.
 *
 * Props:
 *   visible        {boolean}  - Controls modal visibility
 *   onClose        {Function} - Called when dismissing
 *   onSubmit       {Function} - Called with { title, body }
 *   initialTitle   {string}   - Pre-fill title (edit mode)
 *   initialBody    {string}   - Pre-fill body (edit mode)
 */
export default function AddNoteModal({
  visible,
  onClose,
  onSubmit,
  initialTitle,
  initialBody,
}) {
  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => {
            if (!title.trim() && !body.trim()) onClose()
          }}
        />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.heading}>
            {initialTitle ? 'Edit note' : 'New note'}
          </Text>

          <TextInput
            ref={titleRef}
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#9CA3AF"
            style={styles.titleInput}
            returnKeyType="next"
          />

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Add note content…"
            placeholderTextColor="#9CA3AF"
            style={styles.bodyInput}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
            >
              <Text style={styles.submitText}>
                {initialTitle ? 'Save changes' : 'Add Note'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000050',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  bodyInput: {
    fontSize: 15,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 15,
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
})
