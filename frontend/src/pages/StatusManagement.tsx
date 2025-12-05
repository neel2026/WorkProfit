import Layout from '../components/Layout';

const STATUSES = [
    { id: 'TODO', name: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { id: 'IN_PROGRESS', name: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { id: 'REVIEW', name: 'Review', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'DONE', name: 'Done', color: 'bg-green-100 text-green-800' },
];

export default function StatusManagement() {
    return (
        <Layout>
            <div className="flex flex-col gap-6 w-full">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Task Statuses</h1>
                    {/* <button className="px-4 py-2 bg-primary text-white rounded-lg opacity-50 cursor-not-allowed" title="System defined">
                        <span className="material-symbols-outlined align-middle mr-1">add</span> Add Status
                    </button> */}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Preview</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {STATUSES.map(status => (
                                <tr key={status.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {status.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                        {status.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${status.color}`}>
                                            {status.name}
                                        </span>
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
                    * Default system statuses cannot be modified in this version.
                </p>
            </div>
        </Layout>
    );
}
