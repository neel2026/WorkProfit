import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
    const { user } = useAuthStore();

    const stats = [
        { label: 'Total Projects', value: 12, icon: 'folder', color: 'bg-blue-500' },
        { label: 'Active Projects', value: 5, icon: 'rocket_launch', color: 'bg-green-500' },
        { label: 'Total Tasks', value: 48, icon: 'task_alt', color: 'bg-purple-500' },
        { label: 'Completed Tasks', value: 32, icon: 'check_circle', color: 'bg-teal-500' },
        { label: 'Team Members', value: 8, icon: 'group', color: 'bg-orange-500' },
        { label: 'Active Users', value: 6, icon: 'person_check', color: 'bg-pink-500' },
    ];

    const recentTasks = [
        { id: 1, title: 'Design System Update', project: { name: 'Website Redesign' }, assignedTo: { name: 'John Doe' }, dueDate: '2024-03-20', completed: false },
        { id: 2, title: 'API Integration', project: { name: 'Mobile App' }, assignedTo: { name: 'Jane Smith' }, dueDate: '2024-03-22', completed: true },
        { id: 3, title: 'User Testing', project: { name: 'Website Redesign' }, assignedTo: { name: 'Mike Johnson' }, dueDate: '2024-03-25', completed: false },
    ];

    const projects = [
        { id: 1, name: 'Website Redesign', description: 'Revamping the corporate website with new branding', _count: { tasks: 15 }, status: 'IN_PROGRESS' },
        { id: 2, name: 'Mobile App', description: 'iOS and Android app development', _count: { tasks: 24 }, status: 'PLANNING' },
        { id: 3, name: 'Marketing Campaign', description: 'Q2 Digital Marketing Strategy', _count: { tasks: 8 }, status: 'COMPLETED' },
        { id: 4, name: 'Internal Tools', description: 'Employee dashboard and HR tools', _count: { tasks: 12 }, status: 'ON_HOLD' },
    ];

    return (
        <div className="flex flex-row min-h-screen bg-background-light font-display">
            <Sidebar />

            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 overflow-y-auto w-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.first_name}!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                    <span className="material-symbols-outlined text-white text-2xl">{stat.icon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Tasks</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentTasks.length > 0 ? (
                                recentTasks.map((task: any) => (
                                    <div key={task.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className={`w-10 h-10 rounded-lg ${task.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'} flex items-center justify-center`}>
                                            <span className={`material-symbols-outlined ${task.completed ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{task.project?.name || 'No project'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{task.assignedTo?.name || 'Unassigned'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No tasks yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Projects Overview</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map((project: any) => (
                                <div key={project.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description?.substring(0, 60)}...</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{project._count?.tasks || 0} tasks</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                            project.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
