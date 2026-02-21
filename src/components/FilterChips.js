import { Text, Pressable, StyleSheet, ScrollView, View } from 'react-native'
import { useCallback } from 'react'

const FILTERS = [
  { key: 'high', label: 'High', type: 'priority', color: '#EF4444' },
  { key: 'medium', label: 'Medium', type: 'priority', color: '#F59E0B' },
  { key: 'low', label: 'Low', type: 'priority', color: '#10B981' },
  { key: 'Work', label: 'Work', type: 'category', color: '#6366F1' },
]

export default function FilterChips({ activeFilters, onToggle }) {
  const handlePress = useCallback(
    filter => {
      onToggle(filter)
    },
    [onToggle]
  )

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {FILTERS.map(filter => {
        const isActive = activeFilters.includes(filter.key)

        return (
          <Pressable
            key={filter.key}
            hitSlop={8}
            onPress={() => handlePress(filter)}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.activeChip(filter.color),
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.dot, { backgroundColor: filter.color }]} />
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
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  pressed: {
    opacity: 0.7,
  },

  activeChip: color => ({
    backgroundColor: color,
    borderColor: color,
    elevation: 3,
  }),

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  text: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  textActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
})