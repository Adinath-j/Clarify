import { View, Text, StyleSheet, Pressable } from 'react-native'
import useTheme from '../hooks/useTheme'

export default function SuggestionCard() {
  const { colors } = useTheme()

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.icon, { backgroundColor: colors.surface }]} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Suggestion</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          You have 3 overdue tasks from yesterday.
        </Text>

        <View style={styles.actions}>
          <Pressable>
            <Text style={[styles.primary, { color: colors.primary }]}>Review now</Text>
          </Pressable>
          <Pressable>
            <Text style={[styles.secondary, { color: colors.textSecondary }]}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    marginTop: 4,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  primary: {
    fontWeight: '600',
    marginRight: 16,
  },
  secondary: {
  },
})
