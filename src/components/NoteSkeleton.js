import { View, StyleSheet } from 'react-native'
import Skeleton from './Skeleton'
import useTheme from '../hooks/useTheme'

export default function NoteSkeleton() {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Skeleton height={16} width="70%" />
      <Skeleton height={14} width="100%" />
      <Skeleton height={14} width="90%" />
      <Skeleton height={12} width="40%" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, marginBottom: 12, gap: 8 },
})
