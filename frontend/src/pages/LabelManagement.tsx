import { useEffect, useState } from 'react';
import apiClient from '../services/api';
import Layout from '../components/Layout';

interface Label {
    id: number;
    name: string;
    color: string;
}

interface LabelFormData {
    name: string;
    color: string;
}

export default function LabelManagement() {
    const [labels, setLabels] = useState<Label[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
    const [formData, setFormData] = useState<LabelFormData>({ name: '', color: '#3B82F6' });

    useEffect(() => {
        fetchLabels();
    }, []);

    const fetchLabels = async () => {
        try {
            const response = await apiClient.get('/labels/');
            setLabels(response.data);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch labels');
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedLabel(null);
        setFormData({ name: '', color: '#3B82F6' });
        setIsModalOpen(true);
    };

    const handleEdit = (label: Label) => {
        setSelectedLabel(label);
        setFormData({ name: label.name, color: label.color });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await apiClient.delete(`/labels/${id}`);
            fetchLabels();
        } catch (err) {
            alert('Failed to delete label');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedLabel) {
                await apiClient.patch(`/labels/${selectedLabel.id}`, formData);
            } else {
                await apiClient.post('/labels/', formData);
            }
            setIsModalOpen(false);
            fetchLabels();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to save label');
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <Layout>
            <div className="flex flex-col gap-6 w-full">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Labels</h1>
                    <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2">
                        <span className="material-symbols-outlined">add</span> Add Label
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Color</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {labels.map(label => (
                                <tr key={label.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        <span className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: label.color }}>
                                            {label.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }}></div>
                                            {label.color}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(label)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(label.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{selectedLabel ? 'Edit Label' : 'Add Label'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
