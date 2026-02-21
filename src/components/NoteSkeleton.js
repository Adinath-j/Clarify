import { View, StyleSheet } from 'react-native'
import Skeleton from './Skeleton'

export default function NoteSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={16} width="70%" />
      <Skeleton height={14} width="100%" />
      <Skeleton height={14} width="90%" />
      <Skeleton height={12} width="40%" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
})
