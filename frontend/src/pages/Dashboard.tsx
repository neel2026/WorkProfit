import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
    const { logout, token, user } = useAuthStore();

    return (
        <div className="flex flex-row min-h-screen bg-background-light font-display">
            <Sidebar />

            <main className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center justify-center size-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZ07h5cCPMeM9sPMfzA6NadlwdYFWsXvkSDq3sr_q4Jm7iBvB38ib-0Q3B12wLe44VAPxVzt1I_jHav1sP05n4_wfYnHt2ueVKfblhNu5xhu7Ll9b7Dw-mhb4cB0J0CJGJ9AEu8QywmkJ8xapP2sXyompntLkY7TwZ10BCmBMKGIBJe9NLsd8uYKB24ldnsT-onaaqfJB5_eFvMe9zWzGuW8aQ1AvuXRfxjU66qt9tT30BUh1qSKnEsK7AhVmDV771eyA_LukTmqFK")' }}
                            ></div>
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex flex-col p-8 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome back, {user?.first_name}!</h2>
                        <p className="text-slate-600 mb-4">You are successfully authenticated as a <strong>{user?.role}</strong>.</p>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                                <p className="text-green-800 text-sm font-medium">
                                    Authentication working correctly
                                </p>
                            </div>
                            <p className="text-green-700 text-xs font-mono bg-green-100 p-2 rounded break-all">
                                {token}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <span className="material-symbols-outlined">folder</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Active Projects</p>
                                    <h3 className="text-2xl font-bold text-slate-900">12</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <span className="material-symbols-outlined">group</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Team Members</p>
                                    <h3 className="text-2xl font-bold text-slate-900">24</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                    <span className="material-symbols-outlined">task_alt</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Pending Tasks</p>
                                    <h3 className="text-2xl font-bold text-slate-900">8</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
