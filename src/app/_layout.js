import { View } from 'react-native'
import { Tabs }  from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import AppShell      from '../AppShell'
import SyncStatusBar from '../components/SyncStatusBar'
import useTheme      from '../hooks/useTheme'

export default function Layout() {
  const theme = useTheme()
  const { colors } = theme

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppShell />

      {/* Dynamic status bar for dark/light mode */}
      <StatusBar style={colors.statusBarStyle === 'dark-content' ? 'dark' : 'light'} />

      {/* Slim sync/offline indicator — sits just below the safe area */}
      <SyncStatusBar />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor:   colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor:  colors.tabBarBorder,
            borderTopWidth:  1,
            height:          64,
            paddingBottom:   8,
            paddingTop:      8,
          },
          tabBarLabelStyle: {
            fontSize:   12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkmark-circle" size={size} color={color} />
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
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="analytics" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  )
}
