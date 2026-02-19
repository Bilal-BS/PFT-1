import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from './dashboard/TopBar';
import ModernSidebar from './ModernSidebar';
import { useThemeStore } from '../store/themeStore';

export default function MainLayout({ children }) {
    const [searchParams] = useSearchParams();
    const isCustomizing = searchParams.get('customize') === 'true';
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, setTheme } = useThemeStore();

    // Initialize theme on mount
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        // Sync with Tailwind dark mode
        const darkSkins = ['cyber', 'matrix', 'stealth', 'gold', 'dark', 'midnight', 'carbon', 'amoled', 'glitch'];
        if (darkSkins.includes(theme)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <div className="min-h-screen bg-[var(--bg-app)] flex overflow-hidden">
            {!isCustomizing && (
                <ModernSidebar
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                />
            )}

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCustomizing ? '' : (isCollapsed ? 'pl-24' : 'pl-72')}`}>
                <TopBar />
                <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                    <div className={isCustomizing ? "" : "max-w-[1700px] mx-auto p-6 lg:p-10"}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
