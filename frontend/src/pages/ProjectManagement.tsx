import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

interface UserBrief {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

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
    task_count: number;
    team_lead?: UserBrief;
    client?: UserBrief;
    members?: UserBrief[];
    document_url?: string | null;
    time_used?: number;
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
    document_url: string | null;
}

export default function ProjectManagement() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const isAuthorized = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

    // Users for dropdowns
    const [clients, setClients] = useState<UserBrief[]>([]);
    const [teamLeads, setTeamLeads] = useState<UserBrief[]>([]);
    const [staff, setStaff] = useState<UserBrief[]>([]);

    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        client_id: null,
        team_lead_id: null,
        start_date: '',
        end_date: '',
        status: 'PLANNING',
        member_ids: [],
        document_url: null
    });

    useEffect(() => {
        fetchProjects();
        fetchUsers();
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

    const fetchUsers = async () => {
        try {
            // Fetch users by role for dropdowns
            const [clientsRes, teamLeadsRes, staffRes] = await Promise.all([
                apiClient.get('/users/?role=CLIENT'),
                apiClient.get('/users/?role=TEAM_LEAD'),
                apiClient.get('/users/?role=STAFF')
            ]);
            setClients(clientsRes.data);
            setTeamLeads(teamLeadsRes.data);
            // Combine TEAM_LEAD and STAFF for members dropdown
            setStaff([...teamLeadsRes.data, ...staffRes.data]);
        } catch (err) {
            console.error('Failed to fetch users');
        }
    };

    const handleCreateProject = () => {
        if (!isAuthorized) {
            alert('You do not have permission to create projects.');
            return;
        }
        setEditingProject(null);
        setFormData({
            name: '',
            description: '',
            client_id: null,
            team_lead_id: null,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'PLANNING',
            member_ids: [],
            document_url: null
        });
        setShowModal(true);
    };

    const handleEditProject = (project: Project) => {
        if (!isAuthorized) {
            alert('You do not have permission to edit projects.');
            return;
        }
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            client_id: project.client_id,
            team_lead_id: project.team_lead_id,
            start_date: project.start_date,
            end_date: project.end_date,
            status: project.status,
            member_ids: project.members?.map(m => m.id) || [],
            document_url: project.document_url || null
        });
        setShowModal(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await apiClient.post('/files/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, document_url: response.data.url }));
        } catch (err) {
            alert('File upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Frontend Validation: End Date must be after Start Date
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);

        if (end <= start) {
            alert('End date must be after the start date.');
            return;
        }

        if (!isAuthorized && editingProject) {
            alert('You do not have permission to edit projects.');
            return;
        }

        try {
            if (editingProject) {
                await apiClient.patch(`/projects/${editingProject.id}`, formData);
            } else {
                await apiClient.post('/projects/', formData);
            }
            setShowModal(false);
            fetchProjects();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to save project. Please check your input and try again.';
            alert(errorMessage);
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }
        try {
            await apiClient.delete(`/projects/${projectId}`);
            fetchProjects();
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to delete project. You may not have permission.';
            alert(errorMessage);
        }
    };

    const toggleMember = (userId: number) => {
        setFormData(prev => ({
            ...prev,
            member_ids: prev.member_ids.includes(userId)
                ? prev.member_ids.filter(id => id !== userId)
                : [...prev.member_ids, userId]
        }));
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

    const getUserFullName = (user?: UserBrief) => {
        if (!user) return 'Unassigned';
        return `${user.first_name} ${user.last_name}`;
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timeline</th>
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
                                        {project.document_url && (
                                            <a href={`http://localhost:8000${project.document_url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-sm">description</span> Document
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-lg">person</span>
                                            </div>
                                            <span className="text-sm text-gray-800 dark:text-gray-200">{getUserFullName(project.team_lead)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex -space-x-2">
                                            {(project.members || []).slice(0, 3).map((member) => (
                                                <div key={member.id} className="size-8 rounded-full bg-primary/20 dark:bg-primary/30 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-primary" title={getUserFullName(member)}>
                                                    <span className="text-xs font-bold">{member.first_name.charAt(0)}{member.last_name.charAt(0)}</span>
                                                </div>
                                            ))}
                                            {(project.members?.length || 0) > 3 && (
                                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                                    <span className="text-xs font-bold">+{(project.members?.length || 0) - 3}</span>
                                                </div>
                                            )}
                                            {(!project.members || project.members.length === 0) && (
                                                <span className="text-sm text-gray-400">No members</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-800 dark:text-gray-200">{project.task_count || 0} tasks</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full max-w-[140px]">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500">{Math.round(project.progress_percentage || 0)}%</span>
                                                <span className="text-gray-400">{project.time_used || 0}/{project.duration_days || 0}d</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary h-1.5 rounded-full"
                                                    style={{ width: `${Math.min(project.progress_percentage || 0, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(project.status)}`}>
                                            {formatStatus(project.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => navigate(`/projects/${project.id}/tasks`)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300" title="View Tasks">
                                                <span className="material-symbols-outlined">list_alt</span>
                                            </button>
                                            {isAuthorized && (
                                                <>
                                                    <button onClick={() => handleEditProject(project)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                    <button onClick={() => setPendingDeleteId(project.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pendingDeleteId !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Project</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPendingDeleteId(null)}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    const idToDelete = pendingDeleteId;
                                    setPendingDeleteId(null);
                                    if (idToDelete !== null) {
                                        await handleDeleteProject(idToDelete);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Document</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                        {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
                                    </div>
                                    {formData.document_url && (
                                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Document uploaded
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client</label>
                                        <select
                                            value={formData.client_id || ''}
                                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select Client</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.first_name} {client.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Lead</label>
                                        <select
                                            value={formData.team_lead_id || ''}
                                            onChange={(e) => setFormData({ ...formData, team_lead_id: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select Team Lead</option>
                                            {teamLeads.map(lead => (
                                                <option key={lead.id} value={lead.id}>
                                                    {lead.first_name} {lead.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Members</label>
                                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto bg-white dark:bg-gray-700">
                                        {staff.length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No staff members available</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {staff.map(member => (
                                                    <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-1 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.member_ids.includes(member.id)}
                                                            onChange={() => toggleMember(member.id)}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {member.first_name} {member.last_name}
                                                        </span>
                                                        <span className="text-xs text-gray-400">({member.role})</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {formData.member_ids.length > 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {formData.member_ids.length} member(s) selected
                                        </p>
                                    )}
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
