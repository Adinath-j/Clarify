import { useEffect } from 'react'
import useTodoStore from './store/todoStore'
import useNotesStore from './store/notesStore'
import useAppLifecycle from './hooks/useAppLifecycle'
import useNetwork from './hooks/useNetwork'

export default function AppShell() {
  useAppLifecycle()
  useNetwork()

  const hydrateTodos = useTodoStore(s => s.hydrate)
  const hydrateNotes = useNotesStore(s => s.hydrate)

  useEffect(() => {
    hydrateTodos()
    hydrateNotes()
  }, [])

  return null
}