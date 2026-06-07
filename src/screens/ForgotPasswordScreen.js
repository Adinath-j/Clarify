import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import supabase from '../services/supabase'
import useTheme from '../hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'

export default function ForgotPasswordScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.')
      return
    }

    setLoading(true)
    const resetUrl = Linking.createURL('/reset-password') // Not implemented in this boilerplate, but needed for Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    })
    setLoading(false)

    if (error) {
      Alert.alert('Reset Failed', error.message)
    } else {
      Alert.alert('Success', 'Check your email for the password reset link.')
      router.push('/login')
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter your email address and we'll send you a link to reset your password.</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 8, marginTop: 40 },
  subtitle: { fontSize: 16, marginBottom: 32, lineHeight: 24 },
  form: { gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  primaryButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
