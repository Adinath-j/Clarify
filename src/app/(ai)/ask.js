import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import useTheme from '../../hooks/useTheme'
import { askAI } from '../../services/aiService'
import Markdown from 'react-native-markdown-display'

const EXAMPLES = [
  "Find my internship notes",
  "Summarize my recent work",
  "What did I write about Supabase?",
  "Show overdue work tasks"
]

export default function AskAIScreen() {
  const { colors, layout, dark } = useTheme()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollViewRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (textToSubmit = query) => {
    if (!textToSubmit.trim() || isLoading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    const userMsg = { role: 'user', content: textToSubmit.trim() }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    setIsLoading(true)

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100)

    try {
      // Create a temporary assistant message that we will update
      const assistantMsg = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMsg])

      const responseText = await askAI(userMsg.content, (chunk) => {
        // Stream callback (might just fire once with full text depending on RN fetch)
        setMessages(prev => {
          const newMsgs = [...prev]
          newMsgs[newMsgs.length - 1].content = chunk
          return newMsgs
        })
      })

      // Ensure final text is set
      setMessages(prev => {
        const newMsgs = [...prev]
        newMsgs[newMsgs.length - 1].content = responseText
        return newMsgs
      })

    } catch (err) {
      console.warn(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Ensure Supabase Edge Functions are running.' }])
    } finally {
      setIsLoading(false)
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  const QuickAction = ({ icon, label, onPress }) => (
    <TouchableOpacity 
      style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  )

  const isChatActive = messages.length > 0

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Clarify AI</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          
          {!isChatActive ? (
            <>
              {/* Hero */}
              <View style={styles.hero}>
                <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.avatar}>
                  <View style={styles.eyes}>
                    <View style={styles.eye} />
                    <View style={styles.eye} />
                  </View>
                </LinearGradient>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Clarify AI</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Search, understand and organize your notes.</Text>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>I can help you with</Text>
              <View style={styles.actionsGrid}>
                <QuickAction icon="search" label="Find anything in my notes" onPress={() => handleSubmit("Find my most important notes")} />
                <QuickAction icon="document-text" label="Summarize a topic" onPress={() => handleSubmit("Summarize my notes")} />
                <QuickAction icon="calendar" label="Plan my day" onPress={() => handleSubmit("Based on my tasks, plan my day")} />
                <QuickAction icon="git-network" label="Break down a task" onPress={() => router.push('/(ai)/breakdown')} />
              </View>

              <View style={styles.footer}>
                <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  AI uses only your own notes and tasks.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.chatContainer}>
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user'
                return (
                  <View key={idx} style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
                    {!isUser && (
                      <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.smallAvatar}>
                        <Ionicons name="sparkles" size={12} color="#fff" />
                      </LinearGradient>
                    )}
                    <View style={[
                      styles.messageBubble, 
                      isUser ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.assistantBubble, { backgroundColor: colors.surfaceContainer }]
                    ]}>
                      {isUser ? (
                        <Text style={styles.userText}>{msg.content}</Text>
                      ) : (
                        msg.content === '' ? (
                          <ActivityIndicator color={colors.primary} size="small" />
                        ) : (
                          <Markdown style={{
                            body: { color: colors.textPrimary, fontSize: 16, lineHeight: 24 },
                            code_inline: { backgroundColor: colors.surface, color: colors.primary, borderRadius: 4, padding: 2 },
                            code_block: { backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: 8, padding: 12 },
                            bullet_list: { marginTop: 0, marginBottom: 0 },
                            list_item: { marginTop: 4, marginBottom: 4 }
                          }}>
                            {msg.content}
                          </Markdown>
                        )
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )}

        </ScrollView>

        {/* Search Input fixed at bottom */}
        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceContainer, borderColor: 'transparent' }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={isChatActive ? "Ask a follow up..." : EXAMPLES[placeholderIndex]}
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSubmit()}
              returnKeyType="send"
            />
            <TouchableOpacity 
              style={[styles.searchBtn, { backgroundColor: query ? colors.primary : 'transparent' }]}
              onPress={() => handleSubmit()}
              disabled={!query.trim() || isLoading}
            >
              <Ionicons name="arrow-up" size={20} color={query ? '#fff' : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' },
  
  hero: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }
  },
  eyes: { flexDirection: 'row', gap: 12 },
  eye: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.9)' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginTop: 10 },
  actionsGrid: { gap: 12 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16, borderWidth: 1
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 16
  },
  actionLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 6 },
  footerText: { fontSize: 13 },

  inputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    padding: 6, borderRadius: 24, borderWidth: 1,
  },
  searchInput: {
    flex: 1, minHeight: 40, paddingHorizontal: 16, fontSize: 16, maxHeight: 100
  },
  searchBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 8
  },

  chatContainer: { gap: 24 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 8 },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAssistant: { justifyContent: 'flex-start' },
  smallAvatar: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4
  },
  messageBubble: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 20, maxWidth: '85%'
  },
  userBubble: { borderBottomRightRadius: 4 },
  assistantBubble: { borderBottomLeftRadius: 4 },
  userText: { color: '#fff', fontSize: 16, lineHeight: 22 }
})
