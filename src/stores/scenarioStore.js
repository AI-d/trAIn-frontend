import { create } from 'zustand';
import apiClient from "@/services/apiClient.js";

/**
 * 시나리오 상태 관리 Store
 * - 시나리오 목록 조회
 * - 기본 시나리오 조회
 * - 사용자 커스텀 시나리오 조회
 * - 선택된 시나리오 관리
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
    /**
     * 전체 시나리오 목록 조회
     */
    fetchScenarios: async () => {
        set({ loading: true, error: null });
        try {
            const data = await apiClient.get('/scenarios');
            set({
                scenarios: data.data || [],
                loading: false
            });
        } catch (error) {
            set({
                error: error.message || '시나리오 조회에 실패했습니다.',
                loading: false
            });
        }
    },

    /**
     * 기본 시나리오 조회
     */
    fetchDefaultScenarios: async () => {
        set({ loading: true, error: null });
        try {
            const data = await apiClient.get('/scenarios/default');
            set({
                defaultScenarios: data.data || [],
                loading: false
            });
        } catch (error) {
            set({
                error: error.message || '기본 시나리오 조회에 실패했습니다.',
                loading: false
            });
        }
    },

    /**
     * 사용자 커스텀 시나리오 조회
     * @param {number} userId - 사용자 ID
     */
    fetchUserScenarios: async (userId) => {
        set({ loading: true, error: null });
        try {
            const data = await apiClient.get(`/scenarios/me/${userId}`);
            set({
                userScenarios: data.data || [],
                loading: false
            });
        } catch (error) {
            set({
                error: error.message || '사용자 시나리오 조회에 실패했습니다.',
                loading: false
            });
        }
    },

    /**
     * 시나리오 상세 조회
     * @param {number} id - 시나리오 ID
     */
    fetchScenarioById: async (id) => {
        set({ loading: true, error: null });
        try {
            const data = await apiClient.get(`/scenarios/me/${id}`);
            set({
                selectedScenario: data.data,
                loading: false
            });
        } catch (error) {
            set({
                error: error.message || '시나리오 상세 조회에 실패했습니다.',
                loading: false
            });
        }
    },

    /**
     * 사용자 커스텀 시나리오 생성
     * @param {object} scenarioData - 시나리오 데이터
     */
    createScenario: async (scenarioData) => {
        set({ loading: true, error: null });
        try {
            const data = await apiClient.post(`/scenarios/`, scenarioData);
            // 생성 후 사용자 시나리오 목록 다시 조회
            await get().fetchUserScenarios(scenarioData.ownerId);
            set({ loading: false });
            return data.data;
        } catch (error) {
            set({
                error: error.message || '시나리오 생성에 실패했습니다.',
                loading: false
            });
            throw error;
        }
    },

    /**
     * 사용자 커스텀 시나리오 삭제
     * @param {number} userId - 사용자 ID
     * @param {number} scenarioId - 시나리오 ID
     */
    deleteScenario: async (userId, scenarioId) => {
        set({ loading: true, error: null });
        try {
            await apiClient.delete(`/scenarios/me/${userId}/${scenarioId}`);
            // 삭제 후 사용자 시나리오 목록 다시 조회
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

    /**
     * 시나리오 선택
     * @param {object} scenario - 선택된 시나리오
     */
    setSelectedScenario: (scenario) => {
        set({ selectedScenario: scenario });
    },

    /**
     * 에러 초기화
     */
    clearError: () => {
        set({ error: null });
    },

    /**
     * 스토어 초기화
     */
    reset: () => {
        set({
            scenarios: [],
            defaultScenarios: [],
            userScenarios: [],
            selectedScenario: null,
            loading: false,
            error: null,
        });
    },
}));

export default useScenarioStore;