import { View, StyleSheet } from 'react-native'
import Skeleton from './Skeleton'

export default function InsightsSkeleton() {
  return (
    <View>
      {/* Completion card */}
      <View style={styles.card}>
        <Skeleton height={14} width="40%" />
        <Skeleton height={40} width="30%" />
        <Skeleton height={14} width="80%" />
      </View>

      {/* Chart */}
      <View style={styles.card}>
        <Skeleton height={16} width="50%" />
        <View style={styles.chartRow}>
          {[...Array(7)].map((_, i) => (
            <Skeleton
              key={i}
              height={40 + i * 10}
              width={16}
              radius={6}
            />
          ))}
        </View>
      </View>

      {/* Highlights */}
      <View style={styles.card}>
        <Skeleton height={14} width="60%" />
        <Skeleton height={14} width="90%" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 12,
  },
})
