import { useEffect, useState } from 'react';
import apiClient from '../services/api';
import Layout from '../components/Layout';

interface Project {
    id: number;
    name: string;
    description: string | null;
    client_id: number | null;
    team_lead_id: number | null;
    start_date: string;
    end_date: string;
    status: string;
    progress_percentage: number;
    duration_days: number;
    team_lead?: { name: string };
    members?: any[];
    _count?: { tasks: number };
}

interface ProjectFormData {
    name: string;
    description: string;
    client_id: number | null;
    team_lead_id: number | null;
    start_date: string;
    end_date: string;
    status: string;
    member_ids: number[];
}

export default function ProjectManagement() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        client_id: null,
        team_lead_id: null,
        start_date: '',
        end_date: '',
        status: 'PLANNING',
        member_ids: []
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await apiClient.get('/projects/');
            setProjects(response.data);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch projects');
            setIsLoading(false);
        }
    };

    const handleCreateProject = () => {
        setEditingProject(null);
        setFormData({
            name: '',
            description: '',
            client_id: null,
            team_lead_id: null,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'PLANNING',
            member_ids: []
        });
        setShowModal(true);
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            client_id: project.client_id,
            team_lead_id: project.team_lead_id,
            start_date: project.start_date,
            end_date: project.end_date,
            status: project.status,
            member_ids: []
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await apiClient.patch(`/projects/${editingProject.id}`, formData);
            } else {
                await apiClient.post('/projects/', formData);
            }
            setShowModal(false);
            fetchProjects();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to save project');
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await apiClient.delete(`/projects/${projectId}`);
            fetchProjects();
        } catch (err) {
            alert('Failed to delete project');
        }
    };

    const getStatusClasses = (status: string) => {
        const classes: Record<string, string> = {
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            'ON_HOLD': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'PLANNING': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return classes[status] || classes['PLANNING'];
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <Layout>
            <div className="flex flex-col gap-4 sm:gap-6 w-full">
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Projects</h1>
                    <button
                        onClick={handleCreateProject}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Create Project
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/5">Project Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team Lead</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Members</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tasks</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                                        {project.description && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{project.description.substring(0, 50)}{project.description.length > 50 ? '...' : ''}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-lg">person</span>
                                            </div>
                                            <span className="text-sm text-gray-800 dark:text-gray-200">{project.team_lead_id ? `User ${project.team_lead_id}` : 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="size-8 rounded-full bg-primary/20 dark:bg-primary/30 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-primary">
                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-800 dark:text-gray-200">{project._count?.tasks || 0} tasks</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(project.status)}`}>
                                            {formatStatus(project.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditProject(project)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button onClick={() => handleDeleteProject(project.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto mx-4">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                            {editingProject ? 'Edit Project' : 'Create New Project'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="PLANNING">Planning</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
                                >
                                    {editingProject ? 'Save Changes' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
