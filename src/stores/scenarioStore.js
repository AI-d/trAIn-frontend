import { create } from 'zustand';
import apiClient from "@/services/apiClient.js";

/**
 * 시나리오 상태 관리 Store
 */
const useScenarioStore = create((set, get) => ({
    // State
    scenarios: [],
    defaultScenarios: [],
    userScenarios: [],
    selectedScenario: null,
    loading: false,
    error: null,

    // Actions
    fetchScenarios: async () => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get('/scenarios');
            set({
                scenarios: res.data?.data || [],
                loading: false
            });
        } catch (error) {
            set({
                error: error.message || '시나리오 조회에 실패했습니다.',
                loading: false
            });
        }
    },

    fetchDefaultScenarios: async () => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get('/scenarios/default');
            set({
                defaultScenarios: res.data?.data || [],
                loading: false
            });
        } catch (error) {
            set({
                error: error.message || '기본 시나리오 조회에 실패했습니다.',
                loading: false
            });
        }
    },

    fetchUserScenarios: async (userId) => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get(`/scenarios/me/${userId}`);
            set({
                userScenarios: res.data?.data || [],
                loading: false
            });
        } catch (error) {
            set({
                error: error.message || '사용자 시나리오 조회에 실패했습니다.',
                loading: false
            });
        }
    },

    fetchScenarioById: async (userId, scenarioId) => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.get(`/scenarios/me/${userId}/${scenarioId}`);
            set({
                selectedScenario: res.data?.data || null,
                loading: false
            });
        } catch (error) {
            set({
                error: error.message || '시나리오 상세 조회에 실패했습니다.',
                loading: false
            });
        }
    },

    createScenario: async (scenarioData) => {
        set({ loading: true, error: null });
        try {
            const res = await apiClient.post('/scenarios', scenarioData);
            // 생성 후 사용자 시나리오 다시 조회
            await get().fetchUserScenarios(scenarioData.ownerId);
            set({ loading: false });
            return res.data?.data;
        } catch (error) {
            set({
                error: error.message || '시나리오 생성에 실패했습니다.',
                loading: false
            });
            throw error;
        }
    },

    deleteScenario: async (userId, scenarioId) => {
        set({ loading: true, error: null });
        try {
            await apiClient.delete(`/scenarios/me/${userId}/${scenarioId}`);
            // 삭제 후 사용자 시나리오 다시 조회
            await get().fetchUserScenarios(userId);
            set({ loading: false });
        } catch (error) {
            set({
                error: error.message || '시나리오 삭제에 실패했습니다.',
                loading: false
            });
            throw error;
        }
    },

    setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),
    clearError: () => set({ error: null }),
    reset: () => set({
        scenarios: [],
        defaultScenarios: [],
        userScenarios: [],
        selectedScenario: null,
        loading: false,
        error: null,
    }),
}));

export default useScenarioStore;
