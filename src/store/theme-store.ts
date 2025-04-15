import { create } from 'zustand'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false, // Set light mode as default
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}))
