import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isThemeInitialized, setIsThemeInitialized] = useState(false);

    // Initialize theme from localStorage ONCE on mount
    useEffect(() => {
        // Get stored preference or default to light
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = storedTheme === 'dark';

        // Set state
        setIsDark(prefersDark);

        // Apply to DOM - REMOVE any existing dark class first, then add if needed
        document.documentElement.classList.remove('dark');
        if (prefersDark) {
            document.documentElement.classList.add('dark');
        }

        // Mark theme as initialized
        setIsThemeInitialized(true);

        // If no stored preference, save 'light' as default
        if (!storedTheme) {
            localStorage.setItem('theme', 'light');
        }
    }, []); // Empty dependency array - runs ONCE on mount

    const toggleTheme = () => {
        console.log('Toggle theme clicked. Current state:', isDark);
        const nextTheme = !isDark;

        // Update state
        setIsDark(nextTheme);

        // Update DOM - REMOVE existing class first, then add if needed
        console.log('Updating DOM class list...');
        document.documentElement.classList.remove('dark');
        if (nextTheme) {
            document.documentElement.classList.add('dark');
        }
        console.log('New class list:', document.documentElement.classList.toString());

        // Persist to localStorage
        localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
    };

    // Don't render until theme is initialized to prevent flash
    if (!isThemeInitialized) {
        return null;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden font-display bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* DEBUG OVERLAY - REMOVE BEFORE PRODUCTION */}
            <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-4 rounded text-xs font-mono pointer-events-none opacity-50 hover:opacity-100">
                <div>State isDark: {isDark.toString()}</div>
                <div>DOM has .dark: {document.documentElement.classList.contains('dark').toString()}</div>
                <div>System Dark: {window.matchMedia('(prefers-color-scheme: dark)').matches.toString()}</div>
                <div>Window Size: {window.innerWidth}x{window.innerHeight}</div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR: Full height, always visible on desktop */}
            <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out h-screen`}>
                <Sidebar />
            </div>

            {/* MAIN AREA: Flex-1 to fill remaining space */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">

                {/* Header */}
                <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center px-6 justify-between md:justify-end">

                    {/* Mobile Hamburger Menu */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 md:hidden"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    {/* Mobile Logo */}
                    <div className="flex items-center gap-2 md:hidden">
                        <span className="material-symbols-outlined text-primary text-2xl">data_usage</span>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Workprofit</h2>
                    </div>

                    {/* Theme Toggle Button - Works on ALL screen sizes */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        <span className="material-symbols-outlined text-base">
                            {isDark ? 'dark_mode' : 'light_mode'}
                        </span>
                        <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
                    </button>
                </header>

                {/* Page Content - Full Width, scrollable */}
                <main className="flex-1 overflow-y-auto w-full bg-gray-50 dark:bg-gray-900">
                    <div className="w-full h-full p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
