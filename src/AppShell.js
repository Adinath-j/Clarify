import { useEffect } from 'react'
import useTodoStore  from './store/todoStore'
import useNotesStore from './store/notesStore'
import useUIStore    from './store/uiStore'
import useAppLifecycle from './hooks/useAppLifecycle'
import useNetwork      from './hooks/useNetwork'
import { startSync, stopSync } from './services/syncService'

export default function AppShell() {
  useAppLifecycle()
  useNetwork()

  const hydrateTodos = useTodoStore((s) => s.hydrate)
  const hydrateNotes = useNotesStore((s) => s.hydrate)
  const hydrateTheme = useUIStore((s) => s.hydrateTheme)

  useEffect(() => {
    // Hydrate all stores on mount
    hydrateTheme()
    hydrateTodos()
    hydrateNotes()

    // Start background sync (no-ops if Supabase not configured)
    startSync()

    return () => {
      // Stop sync when app unmounts / goes to background
      stopSync()
    }
  }, [])

  return null
}