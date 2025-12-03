import { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-screen overflow-hidden font-display bg-gray-50 dark:bg-gray-900">

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

                    {/* Desktop Header Space */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Add user menu, notifications etc here */}
                    </div>
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
