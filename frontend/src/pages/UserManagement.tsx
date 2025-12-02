import { useEffect, useState } from 'react';
import apiClient from '../services/api';
import Sidebar from '../components/Sidebar';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    department: string | null;
    is_active: boolean;
    phone_number?: string;
    created_at?: string;
}

interface UserFormData {
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    role: string;
    department: string | null;
    phone_number?: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    onSubmit: (data: UserFormData) => Promise<void>;
    isLoading: boolean;
}

function UserModal({ isOpen, onClose, user, onSubmit, isLoading }: UserModalProps) {
    const isEditing = !!user;

    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'STAFF',
        department: null,
        phone_number: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                password: '',
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                department: user.department,
                phone_number: user.phone_number || '',
            });
        } else {
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                role: 'STAFF',
                department: null,
                phone_number: '',
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...formData };
        if (isEditing && !data.password) {
            delete data.password;
        }
        await onSubmit(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit User' : 'Add New User'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password *
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    )}

                    {isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password (leave blank to keep current)
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="PROJECT_MANAGER">Project Manager</option>
                                <option value="TEAM_LEAD">Team Lead</option>
                                <option value="STAFF">Staff</option>
                                <option value="CLIENT">Client</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Department
                            </label>
                            <select
                                value={formData.department || ''}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value || null })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            >
                                <option value="">None</option>
                                <option value="DEVELOPER">Developer</option>
                                <option value="QA">QA</option>
                                <option value="SALES">Sales</option>
                                <option value="MARKETING">Marketing</option>
                                <option value="HR">HR</option>
                                <option value="SUPPORT">Support</option>
                                <option value="ACCOUNT">Account</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : (isEditing ? 'Update User' : 'Add User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users/');
            setUsers(response.data);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await apiClient.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleSubmit = async (data: UserFormData) => {
        setIsSaving(true);
        try {
            if (selectedUser) {
                await apiClient.patch(`/users/${selectedUser.id}`, data);
            } else {
                await apiClient.post('/users/', data);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to save user');
        } finally {
            setIsSaving(false);
        }
    };

    const getRoleBadgeClass = (role: string) => {
        const classes: Record<string, string> = {
            'ADMIN': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
            'PROJECT_MANAGER': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            'TEAM_LEAD': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            'STAFF': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'CLIENT': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        };
        return classes[role] || classes['STAFF'];
    };

    const formatRole = (role: string) => {
        return role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-96"><div className="text-gray-600 dark:text-gray-400">Loading users...</div></div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-96"><div className="text-red-600">Error loading users</div></div>;
    }

    return (
        <div className="flex flex-row min-h-screen bg-background-light font-display">
            <Sidebar />

            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 w-full overflow-x-hidden">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Users</h1>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Add User
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">person</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{user.first_name} {user.last_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                                            {formatRole(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{user.department || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onSubmit={handleSubmit}
                isLoading={isSaving}
            />
        </div>
    );
}
