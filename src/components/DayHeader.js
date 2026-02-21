import { View, Text, StyleSheet } from 'react-native'
import { getDayLabel, getFullDate } from '../utils/date'

export default function DayHeader({ date }) {
  return (
    <View style={styles.container}>
      <Text style={styles.day}>{getDayLabel(date)}</Text>
      <Text style={styles.date}>{getFullDate(date)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  day: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
})