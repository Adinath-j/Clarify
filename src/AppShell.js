import { useEffect } from 'react'
import useTodoStore  from './store/todoStore'
import useNotesStore from './store/notesStore'
import useAuthStore  from './store/authStore'
import useUIStore    from './store/uiStore'
import useAppLifecycle from './hooks/useAppLifecycle'
import useNetwork      from './hooks/useNetwork'
import { startSync, stopSync } from './services/syncService'
import ExpandingFAB from './components/ExpandingFAB'
import AddTodoModal from './components/AddTodoModal'
import AddNoteModal from './components/AddNoteModal'
import { getDateKey } from './utils/date'

export default function AppShell() {
  useAppLifecycle()
  useNetwork()

  const hydrateAuth  = useAuthStore((s) => s.hydrate)
  const hydrateTodos = useTodoStore((s) => s.hydrate)
  const hydrateNotes = useNotesStore((s) => s.hydrate)
  const hydrateTheme = useUIStore((s) => s.hydrateTheme)
  const hydrateWalkthrough = useUIStore((s) => s.hydrateWalkthrough)

  const { isAddTodoOpen, closeAddTodo, isAddNoteOpen, closeAddNote } = useUIStore()
  const addTodo = useTodoStore((s) => s.addTodo)
  const addNote = useNotesStore((s) => s.addNote)

  useEffect(() => {
    // Hydrate all stores on mount
    hydrateTheme()
    hydrateWalkthrough()
    
    // Chain hydrations to ensure Auth is ready before syncing
    hydrateAuth().then(() => {
      hydrateTodos()
      hydrateNotes()
      // Start background sync (no-ops if Supabase not configured)
      startSync()
    })

    return () => {
      // Stop sync when app unmounts / goes to background
      stopSync()
    }
  }, [])

  return (
    <>
      <ExpandingFAB />

      <AddTodoModal 
        visible={isAddTodoOpen} 
        onClose={closeAddTodo} 
        onSubmit={(title, priority, category) => {
          addTodo({ title, priority, category: category ?? 'General', dateKey: getDateKey(new Date()) })
          closeAddTodo()
        }}
      />

      <AddNoteModal 
        visible={isAddNoteOpen}
        onClose={closeAddNote}
        onSubmit={(title, body) => {
          addNote({ title, body })
          closeAddNote()
        }}
      />
    </>
  )
}