import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
    const location = useLocation();
    const { user } = useAuthStore();

    const navItems = [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/projects', icon: 'folder', label: 'Projects' },
        { path: '/tasks', icon: 'task_alt', label: 'Tasks' },
        { path: '/users', icon: 'group', label: 'Users' },
        { path: '/activity', icon: 'history', label: 'Activity' },
        { path: '/status', icon: 'sell', label: 'Status' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className={`w-64 h-screen flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col ${className}`}>
            {/* Logo/Brand */}
            <div className="flex items-center gap-3 px-6 h-16 flex-shrink-0 border-b border-gray-200 dark:border-gray-800">
                <span className="material-symbols-outlined text-primary text-3xl">data_usage</span>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Workprofit</h2>
            </div>

            {/* Navigation - Scrollable Area */}
            <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                {/* Nav Items */}
                <nav className="flex flex-col gap-2 p-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <p className="text-sm font-semibold">{item.label}</p>
                        </Link>
                    ))}
                </nav>

                {/* User Profile - Sticky at Bottom */}
                <div className="flex items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary text-white">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-gray-800 dark:text-white text-sm font-semibold leading-normal truncate">
                            {user?.first_name || 'Admin'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-normal leading-normal truncate">
                            {user?.role || 'Project Manager'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
