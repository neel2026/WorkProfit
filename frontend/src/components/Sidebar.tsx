import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
    const location = useLocation();
    const { user } = useAuthStore();

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-primary/10 text-primary'
            : 'text-slate-700 hover:bg-slate-100';
    };

    return (
        <aside className="flex h-screen min-h-full flex-col bg-white w-64 p-4 border-r border-slate-200 sticky top-0 font-display">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-3">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAQTKrtkKhd9Ub6abzlTfHgzBcYeSI4k-xaaOvW_MVAUxXh5PgPZlJeorW7i3oFAAEzvDcTbBTfH9b_oY7leYOmZ3C-XSzzTsyX_f7-hhdJM4f8mLVjWyM-tSsyZoHQ2Hi5hxw42mcTm5ubdMzNxs3f7K4cOMNy9OBCCGwsjtPMamEOVtyN63dJzIFKmizQ7ZpR1AHF0Z4tOM1kdBtuObdln7P9EwnQOxn93OnrC6sc9DJ5T2aNqSBofEsjbG78AGNas6Y2ldZ8LOuj")' }}
                    ></div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 text-base font-bold leading-normal">ProjectFlow</h1>
                        <p className="text-slate-500 text-sm font-normal leading-normal">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1 mt-4">
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard')}`}
                    >
                        <span className="material-symbols-outlined text-base">dashboard</span>
                        <p className="text-sm font-medium leading-normal">Dashboard</p>
                    </Link>

                    <Link
                        to="/projects"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/projects')}`}
                    >
                        <span className="material-symbols-outlined text-base font-bold">folder</span>
                        <p className="text-sm font-bold leading-normal">Projects</p>
                    </Link>

                    <Link
                        to="/tasks"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/tasks')}`}
                    >
                        <span className="material-symbols-outlined text-base">task_alt</span>
                        <p className="text-sm font-medium leading-normal">Tasks</p>
                    </Link>

                    {user?.role === 'ADMIN' && (
                        <Link
                            to="/users"
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/users')}`}
                        >
                            <span className="material-symbols-outlined text-base">group</span>
                            <p className="text-sm font-medium leading-normal">Users</p>
                        </Link>
                    )}

                    <div className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <span className="material-symbols-outlined text-base">history</span>
                        <p className="text-sm font-medium leading-normal">Activity</p>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <span className="material-symbols-outlined text-base">hourglass_empty</span>
                        <p className="text-sm font-medium leading-normal">Status</p>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <span className="material-symbols-outlined text-base">low_priority</span>
                        <p className="text-sm font-medium leading-normal">Priority</p>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <span className="material-symbols-outlined text-base">label</span>
                        <p className="text-sm font-medium leading-normal">Label</p>
                    </div>
                </nav>
            </div>

            <div className="mt-auto">
                <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide">
                    <span className="truncate">Upgrade Plan</span>
                </button>
            </div>
        </aside>
    );
}
