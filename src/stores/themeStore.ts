import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme: Theme) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
        
        set({ theme });
      },
    }),
    {
      name: 'chat-ui-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          
          if (state.theme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.add('light');
          }
        }
      }
    }
  )
);