import { View, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import TodoItem from '../components/TodoItem'
import Skeleton from '../components/Skeleton'
import useTodoStore from '../store/todoStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect } from 'react'

export default function TodosScreen() {
  const { todos, loading, setTodos, setLoading } = useTodoStore()

  useEffect(() => {
    setLoading(true)

    // fake fetch for now
    setTimeout(() => {
      setTodos(
        Array.from({ length: 20 }).map((_, i) => ({
          id: i,
          title: `Todo item ${i + 1}`,
        }))
      )
      setLoading(false)
    }, 800)
  }, [])

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.container}>
      <FlashList
        data={todos}
        renderItem={({ item }) => <TodoItem item={item} />}
        estimatedItemSize={72}
        keyExtractor={item => item.id.toString()}
        />
    </View>
        </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
})
