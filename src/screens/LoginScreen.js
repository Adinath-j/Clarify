import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import supabase from '../services/supabase'
import useTheme from '../hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  React.useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    setLoading(false)

    if (error) {
      Alert.alert('Sign In Failed', error.message)
    }
  }

  const handleOAuthLogin = async (provider) => {
    try {
      const redirectUri = makeRedirectUri()
      console.log('Using Redirect URI:', redirectUri)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        }
      })
      
      if (error) throw error

      if (data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)
        
        if (res.type === 'success') {
          const { params, errorCode } = QueryParams.getQueryParams(res.url)

          if (errorCode) throw new Error(errorCode)

          if (params.access_token && params.refresh_token) {
            await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token,
            })
          } else if (params.code) {
            await supabase.auth.exchangeCodeForSession(params.code)
          }
        }
      }
    } catch (e) {
      Alert.alert('OAuth Error', e.message)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue to Clarify.</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push('/forgot-password')}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Text style={[styles.orText, { color: colors.textSecondary }]}>Or continue with</Text>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity
          style={[styles.socialButton, { borderColor: colors.border }]}
          onPress={() => handleOAuthLogin('google')}
        >
          <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
          <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { borderColor: colors.border }]}
          onPress={() => handleOAuthLogin('github')}
        >
          <Ionicons name="logo-github" size={20} color={colors.textPrimary} />
          <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>GitHub</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={[styles.footerLink, { color: colors.primary }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 56, left: 24, zIndex: 10 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 8, marginTop: 40 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  form: { gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center' },
  eyeButton: { position: 'absolute', right: 16 },
  forgotPassword: { alignSelf: 'flex-end' },
  forgotPasswordText: { fontSize: 14, fontWeight: '600' },
  primaryButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 32, gap: 16 },
  line: { flex: 1, height: 1 },
  orText: { fontSize: 14, fontWeight: '500' },
  socialButtons: { flexDirection: 'row', gap: 16 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderWidth: 1, borderRadius: 12 },
  socialButtonText: { fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '600' }
})
