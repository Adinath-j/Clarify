import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getDateKey, getDayLabel, getFullDate } from '../utils/date'
import useTheme from '../hooks/useTheme'

export default function DayHeader({ date, onChangeDate }) {
  const { colors } = useTheme()
  const isToday = getDateKey(date) === getDateKey(new Date())

  function shiftDay(delta) {
    const next = new Date(date)
    next.setDate(next.getDate() + delta)
    onChangeDate?.(next)
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable hitSlop={12} onPress={() => shiftDay(-1)}
          style={[styles.arrow, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.center}>
          <Text style={[styles.day, { color: colors.textPrimary }]}>{getDayLabel(date)}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{getFullDate(date)}</Text>
        </View>

        <Pressable hitSlop={12} onPress={() => shiftDay(1)}
          style={[styles.arrow, { backgroundColor: isToday ? colors.background : colors.surfaceAlt }]}
          disabled={isToday}>
          <Ionicons name="chevron-forward" size={22} color={isToday ? colors.border : colors.textSecondary} />
        </Pressable>
      </View>

      {!isToday && (
        <Pressable onPress={() => onChangeDate?.(new Date())}
          style={[styles.todayBadge, { backgroundColor: colors.accentLight }]}>
          <Text style={[styles.todayText, { color: colors.accent }]}>Go to Today</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:  { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  row:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  center:     { flex: 1, alignItems: 'center' },
  day:        { fontSize: 24, fontWeight: '700', letterSpacing: 0.5 },
  date:       { fontSize: 13, marginTop: 2 },
  todayBadge: { alignSelf: 'center', marginTop: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  todayText:  { fontSize: 12, fontWeight: '600' },
})