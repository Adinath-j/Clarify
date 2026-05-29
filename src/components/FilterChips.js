import { Text, Pressable, StyleSheet, ScrollView, View } from 'react-native'
import { useCallback } from 'react'
import { FILTER_CHIPS } from '../utils/constants'

export default function FilterChips({ activeFilters, onToggle }) {
  const handlePress = useCallback(
    filter => onToggle(filter),
    [onToggle]
  )

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {FILTER_CHIPS.map(filter => {
        const isActive = activeFilters.includes(filter.key)
        return (
          <Pressable
            key={filter.key}
            hitSlop={8}
            onPress={() => handlePress(filter)}
            style={({ pressed }) => [
              styles.chip,
              isActive && { backgroundColor: filter.color, borderColor: filter.color, elevation: 3 },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.dot, { backgroundColor: isActive ? '#FFFFFF80' : filter.color }]} />
            <Text style={[styles.text, isActive && styles.textActive]}>
              {filter.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pressed: {
    opacity: 0.7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  textActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})