import { View, Text, StyleSheet, Pressable } from 'react-native'

export default function SuggestionCard() {
  return (
    <View style={styles.card}>
      <View style={styles.icon} />

      <View style={styles.content}>
        <Text style={styles.title}>Suggestion</Text>
        <Text style={styles.text}>
          You have 3 overdue tasks from yesterday.
        </Text>

        <View style={styles.actions}>
          <Pressable>
            <Text style={styles.primary}>Review now</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.secondary}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB20',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  text: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  primary: {
    color: '#2563EB',
    fontWeight: '600',
    marginRight: 16,
  },
  secondary: {
    color: '#9CA3AF',
  },
})
