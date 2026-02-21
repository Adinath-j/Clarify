import { create } from 'zustand'

export default create(set => ({
  isOnline: true,
  setOnline: value => set({ isOnline: value }),
}))
