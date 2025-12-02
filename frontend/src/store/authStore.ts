import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../services/api';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    department: string | null;
    is_active: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role: string;
    department?: string;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.post('/auth/login', {
                        email,
                        password,
                    });

                    const { access_token } = response.data;

                    // Store token
                    localStorage.setItem('token', access_token);

                    // For now, we'll decode the user info from the token or make another API call
                    // Simplified: just set authenticated state
                    set({
                        token: access_token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Login failed';
                    set({
                        error: errorMessage,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            register: async (userData: RegisterData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.post('/auth/register', userData);

                    const user = response.data;

                    // After registration, automatically log in
                    await useAuthStore.getState().login(userData.email, userData.password);

                    set({
                        user,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Registration failed';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
