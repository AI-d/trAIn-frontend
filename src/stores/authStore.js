// src/stores/authStore.js

import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';

import apiClient from '@/services/apiClient';
import {setAccessTokenGetter} from '@/services/tokenManager';
import * as authService from '@/services/authService';
import * as userService from '@/services/userService';
import {unwrap} from '@/services/normalize';

const initialState = {
    user: null,
    accessToken: null,
    status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
    error: null,
    isInitialized: false,
};

export const useAuthStore = create(
    devtools(
        immer((set, get) => ({
            ...initialState,

            initializeAuth: async () => {
                if (get().isInitialized) return;

                set({status: 'loading'});
                try {
                    const {data} = await apiClient.post('/users/refresh');
                    const normalized = unwrap(data);
                    const newAccessToken = normalized?.data?.accessToken || normalized?.data;

                    if (!newAccessToken) throw new Error('No access token in refresh response.');

                    set({accessToken: newAccessToken});
                    await get().fetchUser();
                } catch {
                    get().clearAuth();
                } finally {
                    set({isInitialized: true});
                }
            },

            login: async (credentials) => {
                set({status: 'loading', error: null});
                try {
                    const resp = await authService.login(credentials);
                    set({accessToken: resp.accessToken});
                    await get().fetchUser();
                } catch (error) {
                    set({status: 'unauthenticated', error: error.response?.data || error});
                    throw error;
                }
            },

            exchangeCode: async (code) => {
                set({status: 'loading', error: null});
                try {
                    const resp = await authService.exchangeToken(code);
                    set({accessToken: resp.accessToken});
                    await get().fetchUser();
                } catch (error) {
                    set({status: 'unauthenticated', error: error.response?.data || error});
                    throw error;
                }
            },

            completeSocialSignup: async (payload) => {
                set({status: 'loading', error: null});
                try {
                    const resp = await authService.completeSocialSignup(payload);
                    set({accessToken: resp.accessToken});
                    await get().fetchUser();
                } catch (error) {
                    set({status: 'unauthenticated', error: error.response?.data || error});
                    throw error;
                }
            },

            logout: async () => {
                get().clearAuth();
                try {
                    await authService.logout();
                } catch (error) {
                    console.warn('Logout API failed:', error);
                }
            },

            fetchUser: async () => {
                try {
                    const me = await userService.getMyProfile();
                    set({user: me, status: 'authenticated', error: null});
                } catch (error) {
                    get().clearAuth(error.response?.data);
                }
            },

            setAccessToken: (token) => set({accessToken: token}),

            clearAuth: (error = null) => set({
                ...initialState,
                status: 'unauthenticated',
                error,
                isInitialized: get().isInitialized
            }),

            forceLogout: () => {
                set({
                    ...initialState,
                    status: 'unauthenticated',
                    isInitialized: true
                });
            },

            clearError: () => set({error: null}),
        })),
        {name: 'auth-store'}
    )
);

setAccessTokenGetter(() => useAuthStore.getState().accessToken);

export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated');
export const useAuthUser = () => useAuthStore((s) => s.user);
