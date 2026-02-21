export function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function getDayLabel(targetDate) {
  const today = new Date()
  const t = stripTime(today)
  const d = stripTime(targetDate)

  const diff =
    (d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24)

  if (diff === 0) return 'TODAY'
  if (diff === -1) return 'YESTERDAY'
  if (diff === 1) return 'TOMORROW'

  return d.toLocaleDateString(undefined, {
    weekday: 'long',
  }).toUpperCase()
}

export function getFullDate(targetDate) {
  return targetDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function stripTime(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}