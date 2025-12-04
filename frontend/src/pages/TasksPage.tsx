import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import Layout from '../components/Layout';
import { type Task, TaskStatus, TaskPriority } from '../types/task';

export default function TasksPage() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Record<number, any>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [tasksRes, projectsRes] = await Promise.all([
                apiClient.get('/tasks/'),
                apiClient.get('/projects/')
            ]);
            setTasks(tasksRes.data);

            // Create a map of project ID to project data
            const projectMap: Record<number, any> = {};
            projectsRes.data.forEach((project: any) => {
                projectMap[project.id] = project;
            });
            setProjects(projectMap);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setIsLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await apiClient.delete(`/tasks/${taskId}`);
            fetchAllData();
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case TaskPriority.HIGH: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case TaskPriority.LOW: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.TODO: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case TaskStatus.REVIEW: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
            case TaskStatus.DONE: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
    };

    const filteredTasks = filterStatus === 'ALL'
        ? tasks
        : tasks.filter(t => t.status === filterStatus);

    return (
        <Layout>
            <div className="flex flex-col gap-6 w-full">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">All Tasks</h1>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="ALL">All Status</option>
                            {Object.values(TaskStatus).map(status => (
                                <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No tasks found. Create tasks from the Projects page.
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{task.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {projects[task.project_id]?.name || `Project #${task.project_id}`}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm ${isOverdue(task.due_date)
                                                ? 'text-red-600 dark:text-red-400 font-semibold flex items-center gap-1'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {isOverdue(task.due_date) && (
                                                    <span className="material-symbols-outlined text-sm">warning</span>
                                                )}
                                                {task.due_date || 'No date'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View in Project"
                                                >
                                                    <span className="material-symbols-outlined">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
