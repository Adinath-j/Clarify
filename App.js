import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AppShell from './src/AppShell'
import { LogBox } from 'react-native'

LogBox.ignoreLogs([
  'Swipeable is deprecated',
])
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppShell />
    </GestureHandlerRootView>
  )
}
