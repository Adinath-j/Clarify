import { create } from 'zustand'

export default create(set => ({
  loading: false,
  setLoading: value => set({ loading: value }),
}))
