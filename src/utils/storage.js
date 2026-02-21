import AsyncStorage from '@react-native-async-storage/async-storage'

export async function save(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export async function load(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
