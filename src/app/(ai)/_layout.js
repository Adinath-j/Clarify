import { Stack } from 'expo-router'
import useTheme from '../../hooks/useTheme'

export default function AILayout() {
  const { colors } = useTheme()

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.textPrimary,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background }
    }}>
      <Stack.Screen 
        name="ask" 
        options={{ title: 'Ask AI', headerShown: false }} 
      />
      <Stack.Screen 
        name="breakdown" 
        options={{ title: 'Task Breakdown', headerBackTitle: 'Back' }} 
      />
      <Stack.Screen 
        name="insights" 
        options={{ title: 'AI Insights', headerBackTitle: 'Back' }} 
      />
      <Stack.Screen 
        name="search" 
        options={{ title: 'AI Search', headerBackTitle: 'Back' }} 
      />
    </Stack>
  )
}
