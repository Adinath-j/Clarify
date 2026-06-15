import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'
import { View, Platform } from 'react-native'
import { Tabs, useRouter, useSegments, useRootNavigationState } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import AppShell from '../AppShell'
import SyncStatusBar from '../components/SyncStatusBar'
import UndoSnackbar from '../components/UndoSnackbar'
import useTheme from '../hooks/useTheme'
import useAnimatedTheme from '../hooks/useAnimatedTheme'
import useAuthStore from '../store/authStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated from 'react-native-reanimated'

export default function Layout() {
  const theme = useTheme()
  const { animatedStyles } = useAnimatedTheme()
  const { colors } = theme
  const { isLoggedIn, isLoading } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const insets = useSafeAreaInsets()
  const bottomPadding = Math.max(insets.bottom, 12)

  useEffect(() => {
    if (!rootNavigationState?.key) return
    if (isLoading) return
    
    const authScreens = ['welcome', 'login', 'signup', 'forgot-password']
    const isAuthRoute = authScreens.includes(segments[0])
    
    if (!isLoggedIn && !isAuthRoute) {
      router.replace('/welcome')
    } else if (isLoggedIn && isAuthRoute) {
      router.replace('/')
    }
  }, [isLoggedIn, isLoading, segments, rootNavigationState?.key])

  // Removed early return so Tabs mount on first render

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1 }, animatedStyles.bgBackground]}>
        <AppShell />

      {/* Dynamic status bar for dark/light mode */}
      <StatusBar style={theme.dark ? 'light' : 'dark'} />

      {/* Slim sync/offline indicator — sits just below the safe area */}
      <SyncStatusBar />

      {/* Global Undo Snackbar */}
      <UndoSnackbar />

      <Tabs
        sceneContainerStyle={{ backgroundColor: 'transparent' }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: colors.card,
            borderTopWidth: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: 60 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 12,
            elevation: 12,
            shadowColor: '#000',
            shadowOpacity: theme.dark ? 0.3 : 0.1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="albums" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="insights"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        
        <Tabs.Screen
          name="login"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="welcome"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="signup"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="forgot-password"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="account-settings"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="(ai)"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
      </Animated.View>
    </GestureHandlerRootView>
  )
}
