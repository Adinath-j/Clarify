import { create } from 'zustand'

/**
 * Network status store.
 * isOnline     — current connectivity state (updated every 5s by useNetwork)
 * wasOnline    — previous state, used to detect reconnect events
 * onReconnect  — callback fired by networkService when device comes back online
 */
const useNetworkStore = create((set) => ({
  isOnline:   true,
  wasOnline:  true,

  setOnline: (value) =>
    set((state) => ({
      wasOnline: state.isOnline,
      isOnline:  value,
    })),

  /** Called once per reconnection by useNetwork hook */
  onReconnect: null,
  setReconnectCallback: (fn) => set({ onReconnect: fn }),
}))

export default useNetworkStore
