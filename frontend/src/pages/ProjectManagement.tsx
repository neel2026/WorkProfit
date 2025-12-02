import { useEffect, useState } from 'react';
import apiClient from '../services/api';
import Sidebar from '../components/Sidebar';

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
    const [error, setError] = useState<string | null>(null);
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
            setError('Failed to fetch projects');
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

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PLANNING: 'bg-status-gray/10 text-status-gray',
            IN_PROGRESS: 'bg-status-yellow/10 text-status-yellow',
            ON_HOLD: 'bg-status-gray/10 text-status-gray',
            COMPLETED: 'bg-status-green/10 text-status-green',
            CANCELLED: 'bg-status-red/10 text-status-red'
        };
        return colors[status] || 'bg-status-gray/10 text-status-gray';
    };

    const getProgressBarColor = (status: string) => {
        const colors: Record<string, string> = {
            PLANNING: 'bg-primary',
            IN_PROGRESS: 'bg-status-yellow',
            ON_HOLD: 'bg-status-gray',
            COMPLETED: 'bg-status-green',
            CANCELLED: 'bg-status-red'
        };
        return colors[status] || 'bg-primary';
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex flex-row min-h-screen bg-background-light font-display">
            <Sidebar />

            <main className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="flex items-center justify-between border-b border-slate-200 px-8 py-4 bg-white sticky top-0 z-10">
                    <div className="flex w-full max-w-sm">
                        <div className="flex w-full items-center bg-slate-100 rounded-lg px-3 h-10">
                            <span className="material-symbols-outlined text-slate-500">search</span>
                            <input
                                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-slate-900 placeholder-slate-500"
                                placeholder="Search projects..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCreateProject}
                            className="flex items-center gap-2 bg-primary text-white px-4 h-10 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">add</span>
                            Create Project
                        </button>
                        <button className="flex items-center justify-center size-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBAHiLdTMa-ryBTZgkdqagkOqIn8pWbOdPZxs8mkbVZD3Wk8stnjSMAUWXcRD06p75jK9wSz-NeMGdv4bSHoafq26b0V6FL7lhD4kZvr9DnZa9xajfuZd9jHszgFtv62Uk4tl40WKuITgyaw0c1n9AeOP_ef88NOtj2EjJrnCcKrmdcETEeMRlxFK5UsqDA5JPz9Llqh5HVsFF__PUIcHeVlGhUwcenakGOW7Y9amCj2ktFgcvR0o4NiVqbn-pyDjNNZTFI9mhPobEZ")' }}
                        ></div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex flex-col p-8 gap-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Projects</h1>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        {['Status: All', 'Team Lead', 'Sort by: Date'].map((label) => (
                            <button key={label} className="flex h-9 items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                                {label}
                                <span className="material-symbols-outlined text-base text-slate-500">expand_more</span>
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-2/5">Project Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Team Lead</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Members</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timeline</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">{project.name}</div>
                                            <div className="text-sm text-slate-500">{project.description || 'No description'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {project.team_lead_id ? 'TL' : '?'}
                                                </div>
                                                <span className="text-sm text-slate-800">
                                                    {project.team_lead_id ? `User ${project.team_lead_id}` : 'Unassigned'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="size-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                                                        U{i}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${getProgressBarColor(project.status)}`}
                                                        style={{ width: `${project.progress_percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600">{Math.round(project.progress_percentage)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditProject(project)} className="text-slate-400 hover:text-primary">
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                <button onClick={() => handleDeleteProject(project.id)} className="text-slate-400 hover:text-red-600">
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">
                            {editingProject ? 'Edit Project' : 'Create New Project'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        <option value="PLANNING">Planning</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
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
        </div>
    );
}
