import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const { login, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            // Error is handled by the store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light font-display px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary text-5xl">data_usage</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">ProjectFlow</h2>
                        <p className="text-slate-500 mt-2 text-sm">Sign in to your admin account</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-status-red/10 border border-status-red/20 rounded-lg flex items-center gap-3">
                            <span className="material-symbols-outlined text-status-red text-xl">error</span>
                            <p className="text-status-red text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder-slate-400"
                                placeholder="admin@workprofit.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                    Password
                                </label>
                                <a href="#" className="text-sm text-primary font-medium hover:text-blue-700">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder-slate-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white py-2.5 px-4 rounded-lg font-bold hover:bg-blue-600 focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <a href="/register" className="text-primary font-bold hover:text-blue-700">
                                Contact Admin
                            </a>
                        </p>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-xs mt-8">
                    &copy; 2024 ProjectFlow. All rights reserved.
                </p>
            </div>
        </div>
    );
}
