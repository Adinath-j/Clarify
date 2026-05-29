import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

/**
 * Configure how notifications behave when the app is in the foreground.
 * Call this once at app startup (e.g., in AppShell).
 */
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge:  false,
    }),
  })
}

/**
 * Request push notification permissions from the device.
 * @returns {Promise<boolean>} true if permission granted
 */
export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false

  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

/**
 * Schedule a local notification reminder for a task.
 *
 * @param {object} options
 * @param {string} options.title       - Notification title
 * @param {string} options.body        - Notification body text
 * @param {Date}   options.triggerDate - When to fire the notification
 * @returns {Promise<string|null>} notification identifier or null on failure
 */
export async function scheduleTaskReminder({ title, body, triggerDate }) {
  const granted = await requestNotificationPermission()
  if (!granted) {
    console.warn('[Notifications] Permission not granted.')
    return null
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        date: triggerDate,
      },
    })
    return id
  } catch (e) {
    console.warn('[Notifications] scheduleTaskReminder error:', e.message)
    return null
  }
}

/**
 * Cancel a previously scheduled notification by its identifier.
 * @param {string} notificationId
 */
export async function cancelReminder(notificationId) {
  if (!notificationId) return
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  } catch (e) {
    console.warn('[Notifications] cancelReminder error:', e.message)
  }
}

/**
 * Cancel ALL scheduled notifications (e.g., on logout or reset).
 */
export async function cancelAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
  } catch (e) {
    console.warn('[Notifications] cancelAllReminders error:', e.message)
  }
}
