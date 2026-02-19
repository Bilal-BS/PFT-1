import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'light',
            accentColor: '#5551FF',
            borderRadius: '24px',
            fontFamily: 'Outfit',
            animationsEnabled: true,

            setTheme: (theme) => {
                document.documentElement.setAttribute('data-theme', theme);
                // Handle dark mode class for Tailwind
                const darkThemes = ['dark', 'midnight', 'carbon', 'amoled', 'cyber', 'gold', 'business'];
                if (darkThemes.includes(theme)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                set({ theme });
            },

            setAccentColor: (color) => {
                document.documentElement.style.setProperty('--accent', color);
                set({ accentColor: color });
            },

            setRadius: (radius) => {
                document.documentElement.style.setProperty('--radius-app', radius);
                set({ borderRadius: radius });
            },

            setAnimations: (enabled) => {
                set({ animationsEnabled: enabled });
            },

            setFont: (font) => {
                document.documentElement.style.setProperty('--font-app', font);
                set({ fontFamily: font });
            }
        }),
        {
            name: 'pft-theme-storage-v2',
        }
    )
);
