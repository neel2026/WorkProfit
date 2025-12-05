import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import Layout from '../components/Layout';
import { type Task, TaskStatus, TaskPriority, type TaskCreate } from '../types/task';

export default function TaskBoard() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [movingTaskId, setMovingTaskId] = useState<number | null>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<TaskCreate>({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        due_date: '',
        project_id: Number(projectId),
        assignee_id: undefined
    });

    const resetForm = () => {
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            due_date: '',
            project_id: Number(projectId),
            assignee_id: undefined
        });
    };

    useEffect(() => {
        if (projectId) {
            fetchProjectAndTasks();
        }
    }, [projectId]);

    const fetchProjectAndTasks = async () => {
        try {
            const [projectRes, tasksRes] = await Promise.all([
                apiClient.get(`/projects/${projectId}`),
                apiClient.get(`/tasks/?project_id=${projectId}`)
            ]);
            setProject(projectRes.data);
            setTasks(tasksRes.data);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setIsLoading(false);
        }
    };

    const getAssignee = (assigneeId?: number | null) => {
        if (!assigneeId || !project) return null;
        const candidates = [
            ...(project.members || []),
            ...(project.team_lead ? [project.team_lead] : [])
        ];
        return candidates.find((u: any) => u.id === assigneeId) || null;
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate due date is not in the past
        if (formData.due_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(formData.due_date);

            if (dueDate < today) {
                alert('Due date cannot be in the past. Please select today or a future date.');
                return;
            }
        }

        try {
            if (editingTask) {
                await apiClient.patch(`/tasks/${editingTask.id}`, { ...formData, project_id: Number(projectId) });
            } else {
                await apiClient.post('/tasks/', { ...formData, project_id: Number(projectId) });
            }
            setShowModal(false);
            fetchProjectAndTasks();
            resetForm();
        } catch (err) {
            console.error('Failed to save task', err);
            alert('Failed to save task');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await apiClient.delete(`/tasks/${taskId}`);
            fetchProjectAndTasks();
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    const handleDropStatus = async (taskId: number, newStatus: TaskStatus) => {
        const previous = tasks;
        // Optimistic update
        setTasks(prev =>
            prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        setMovingTaskId(taskId);
        try {
            await apiClient.patch(`/tasks/${taskId}`, { status: newStatus, project_id: Number(projectId) });
        } catch (err) {
            console.error('Failed to move task', err);
            // revert on failure
            setTasks(previous);
            alert('Failed to move task. Please try again.');
        } finally {
            setDraggingId(null);
            setMovingTaskId(null);
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

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const columns = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE];

    return (
        <Layout>
            <div className="flex flex-col gap-6 w-full flex-1 overflow-hidden">
                <div className="flex justify-between items-center flex-shrink-0">
                    <div>
                        <button onClick={() => navigate('/projects')} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Projects
                        </button>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">{project?.name} / Tasks</h1>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Task
                    </button>
                </div>
                {movingTaskId !== null && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                        Updating task...
                    </div>
                )}


                <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6">
                    {columns.map(status => (
                        <div
                            key={status}
                            className="flex flex-col gap-4 min-w-[280px] flex-shrink-0 w-full md:w-[calc(25%-18px)]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggingId !== null) {
                                    handleDropStatus(draggingId, status);
                                }
                            }}
                        >
                            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200">{status.replace('_', ' ')}</h3>
                                <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {tasks.filter(t => t.status === status).length}
                                </span>
                            </div>

                            <div
                                className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[320px] pb-4 border border-transparent"
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (draggingId !== null) {
                                        handleDropStatus(draggingId, status);
                                    }
                                }}
                            >
                                {tasks.filter(t => t.status === status).length === 0 && (
                                    <div
                                        className="text-sm text-center text-gray-400 dark:text-gray-500 py-10 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (draggingId !== null) {
                                                handleDropStatus(draggingId, status);
                                            }
                                        }}
                                    >
                                        Drop here to move tasks
                                    </div>
                                )}
                                {tasks.filter(t => t.status === status).map(task => {
                                    const assignee = getAssignee(task.assignee_id);
                                    const initials = assignee ? `${assignee.first_name[0] ?? ''}${assignee.last_name?.[0] ?? ''}`.trim() : '';
                                    return (
                                        <div
                                            key={task.id}
                                            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group flex-shrink-0"
                                            draggable
                                            onDragStart={() => setDraggingId(task.id)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{task.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{task.description}</p>

                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                {task.due_date || 'No date'}
                                            </div>
                                            {assignee ? (
                                                <div
                                                    className="size-7 rounded-full bg-primary/15 dark:bg-primary/25 flex items-center justify-center text-primary text-[10px] font-bold"
                                                    title={`${assignee.first_name} ${assignee.last_name}`}
                                                >
                                                    {initials || 'U'}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-600">Unassigned</span>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button
                                                onClick={() => {
                                                    setEditingTask(task);
                                                    setFormData({
                                                        title: task.title,
                                                        description: task.description || '',
                                                        status: task.status,
                                                        priority: task.priority,
                                                        due_date: task.due_date || '',
                                                        project_id: Number(projectId),
                                                        assignee_id: task.assignee_id || undefined,
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        </div>
                                    );
                                })}
                                {tasks.filter(t => t.status === status).length > 0 && (
                                    <div
                                        aria-hidden
                                        className="h-12"
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (draggingId !== null) {
                                                handleDropStatus(draggingId, status);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl">
                            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h2>
                            <form onSubmit={handleSubmitTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                                    <select
                                        value={formData.assignee_id ?? ''}
                                        onChange={e => setFormData({ ...formData, assignee_id: e.target.value ? Number(e.target.value) : undefined })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {project?.members?.map((m: any) => (
                                            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                                        ))}
                                        {project?.team_lead && (
                                            <option value={project.team_lead.id}>Lead: {project.team_lead.first_name} {project.team_lead.last_name}</option>
                                        )}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            {Object.values(TaskStatus).map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            {Object.values(TaskPriority).map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        {editingTask ? 'Save Task' : 'Create Task'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
