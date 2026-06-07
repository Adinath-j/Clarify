import { Text, Pressable, StyleSheet, ScrollView, View } from 'react-native'
import { useCallback } from 'react'
import { FILTER_CHIPS } from '../utils/constants'
import useTheme from '../hooks/useTheme'

export default function FilterChips({ activeFilters, onToggle }) {
  const { colors } = useTheme()

  const handlePress = useCallback(
    (filter) => onToggle(filter),
    [onToggle]
  )

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {FILTER_CHIPS.map((filter) => {
        const isActive = activeFilters.includes(filter.key)
        return (
          <Pressable
            key={filter.key}
            hitSlop={8}
            onPress={() => handlePress(filter)}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isActive && { backgroundColor: filter.color, borderColor: filter.color, elevation: 3 },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.dot, { backgroundColor: isActive ? '#FFFFFF80' : filter.color }]} />
            <Text style={[styles.text, { color: colors.textPrimary }, isActive && styles.textActive]}>
              {filter.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll:     { flexGrow: 0 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  chip:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1 },
  pressed:    { opacity: 0.7 },
  dot:        { width: 7, height: 7, borderRadius: 4 },
  text:       { fontSize: 13, fontWeight: '500' },
  textActive: { color: '#FFFFFF', fontWeight: '700' },
})