export function calculateStreak(todos) {
  const completed = todos.filter(t => t.completed && !t.deleted)
  if (completed.length === 0) return 0
  
  const dates = [...new Set(completed.map(t => t.dateKey))].sort((a, b) => b.localeCompare(a))
  
  let streak = 0
  
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)
  
  let checkDate = new Date(today)
  
  if (!dates.includes(todayKey)) {
    if (!dates.includes(yesterdayKey)) return 0
    checkDate.setDate(checkDate.getDate() - 1)
  }
  
  for (const dateStr of dates) {
    const expectedKey = checkDate.toISOString().slice(0, 10)
    if (dateStr === expectedKey) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (dateStr > expectedKey) {
      continue
    } else {
      break
    }
  }
  
  return streak
}
