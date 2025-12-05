import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import apiClient from '../services/api';

interface StatusItem {
    id: string;
    name: string;
}

export default function StatusManagement() {
    const [statuses, setStatuses] = useState<StatusItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const res = await apiClient.get<string[]>('/statuses/');
                setStatuses(res.data.map(code => ({
                    id: code,
                    name: code.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
                })));
            } catch (err) {
                console.error('Failed to fetch statuses', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatuses();
    }, []);

    if (isLoading) return <Layout><div className="p-6">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="flex flex-col gap-6 w-full">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Task Statuses</h1>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {statuses.map(status => (
                                <tr key={status.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {status.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                        {status.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">System</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Default statuses are system-defined.
                </p>
            </div>
        </Layout>
    );
}
