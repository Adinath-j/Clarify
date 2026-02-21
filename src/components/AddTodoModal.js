import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native'
import { useRef, useState, useEffect, useCallback } from 'react'

const PRIORITY_STYLE = {
  high: { color: '#EF4444', label: 'High' },
  medium: { color: '#F59E0B', label: 'Medium' },
  low: { color: '#10B981', label: 'Low' },
}

export default function AddTodoModal({
  visible,
  onClose,
  onSubmit,
  initialTitle,
  initialPriority,
}) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!visible) return

    setTitle(initialTitle ?? '')
    setPriority(initialPriority ?? 'medium')

    const t = setTimeout(() => {
      inputRef.current?.focus()
    }, 150)

    return () => clearTimeout(t)
  }, [visible, initialTitle, initialPriority])

  const submit = useCallback(() => {
    const trimmed = title.trim()
    if (!trimmed) return
    onSubmit(trimmed, priority)
    setTitle('')
    onClose()
  }, [title, priority, onSubmit, onClose])

  return (
    <Modal transparent visible={visible} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => {
            if (!title.trim()) onClose()
          }}
        />

        <View style={styles.sheet}>
          <Text style={styles.heading}>
            {initialTitle ? 'Edit task' : 'New task'}
          </Text>

          <TextInput
            ref={inputRef}
            value={title}
            onChangeText={setTitle}
            placeholder="What do you need to do?"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <Text style={styles.sectionLabel}>Priority</Text>

          <View style={styles.priorityRow}>
            {Object.keys(PRIORITY_STYLE).map(key => {
              const active = priority === key
              const { color, label } = PRIORITY_STYLE[key]

              return (
                <Pressable
                  key={key}
                  onPress={() => setPriority(key)}
                  hitSlop={6}
                  style={[
                    styles.priorityChip,
                    active && {
                      backgroundColor: color,
                      borderColor: color,
                      elevation: 3,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      active && styles.priorityTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Pressable
            onPress={submit}
            disabled={!title.trim()}
            style={[
              styles.submitButton,
              !title.trim() && styles.submitDisabled,
            ]}
          >
            <Text style={styles.submitText}>
              {initialTitle ? 'Update Task' : 'Add Task'}
            </Text>
          </Pressable>
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
    backgroundColor: '#00000040',
  },

  sheet: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },

  sectionLabel: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },

  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },

  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  priorityText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  priorityTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  submitButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  submitDisabled: {
    opacity: 0.5,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})