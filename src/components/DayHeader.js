import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getDateKey, getDayLabel, getFullDate } from '../utils/date'

/**
 * Day navigation header — shows the current date label with
 * left/right arrows to step through days one at a time.
 */
export default function DayHeader({ date, onChangeDate }) {
  const isToday = getDateKey(date) === getDateKey(new Date())

  function shiftDay(delta) {
    const next = new Date(date)
    next.setDate(next.getDate() + delta)
    onChangeDate?.(next)
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          hitSlop={12}
          onPress={() => shiftDay(-1)}
          style={styles.arrow}
        >
          <Ionicons name="chevron-back" size={22} color="#6B7280" />
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.day}>{getDayLabel(date)}</Text>
          <Text style={styles.date}>{getFullDate(date)}</Text>
        </View>

        <Pressable
          hitSlop={12}
          onPress={() => shiftDay(1)}
          style={[styles.arrow, isToday && styles.arrowFaded]}
          disabled={isToday}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isToday ? '#D1D5DB' : '#6B7280'}
          />
        </Pressable>
      </View>

      {!isToday && (
        <Pressable onPress={() => onChangeDate?.(new Date())} style={styles.todayBadge}>
          <Text style={styles.todayText}>Go to Today</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  arrowFaded: {
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  day: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  todayBadge: {
    alignSelf: 'center',
    marginTop: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  todayText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
})