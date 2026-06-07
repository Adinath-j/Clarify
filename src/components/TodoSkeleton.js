import { View, StyleSheet } from 'react-native'
import Skeleton from './Skeleton'
import useTheme from '../hooks/useTheme'

export default function TodoSkeleton() {
  const { colors } = useTheme()
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Skeleton height={22} width={22} radius={11} />
      <View style={styles.content}>
        <Skeleton height={16} width="80%" />
        <Skeleton height={12} width="40%" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 14, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  content:   { marginLeft: 12, flex: 1, gap: 6 },
})