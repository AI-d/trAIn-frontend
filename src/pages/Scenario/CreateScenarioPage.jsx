import React, {useState} from 'react';
import useScenarioStore from "@/stores/scenarioStore.js";
import styles from './CreateScenarioPage.module.scss';
import {useNavigate} from "react-router-dom";

const CreateScenarioPage = () => {

    const { createScenario } = useScenarioStore();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prompt: '',
        role: '',
        difficulty: 'MEDIUM',
        category: 'WORK',
        voice: 'ALLOY',
        locale: 'ko-kr' // 한국어 기본 설정
    });

    // TODO: authStore에서 가져오기
    const userId = 1;
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('formData:', formData);
        try {
            await createScenario({
                ownerId: userId,
                ...formData,
            });
            alert('시나리오가 생성되었습니다!');
            navigate('/', {
                state: {
                    activeTab: 'custom'
                }})
        } catch (error) {
            alert('시나리오 생성에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        if (window.confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) {
            navigate('/');
        }
    }

    return (
            <div className={styles.pageContainer} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.header}>새 시나리오 만들기</h2>
                <form id="createScenarioForm" onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>시나리오 제목 *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="예: 동료에게 업무 부탁하기"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>설명 *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="시나리오에 대한 간단한 설명을 입력하세요"
                            rows={3}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>상황 설정 *</label>
                        <textarea
                            value={formData.prompt}
                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                            placeholder="대화 상황을 자세히 설명해주세요"
                            rows={4}
                            required
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>상대방 역할 *</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="예: 팀장, 동료, 고객 등"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>목소리 *</label>
                            <select
                                value={formData.voice}
                                onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                            >
                                <option value="ALLOY">중성적</option>
                                <option value="ASH">차분함</option>
                                <option value="BALLAD">감성적</option>
                                <option value="CORAL">친근함</option>
                                <option value="ECHO">또렷함</option>
                                <option value="SAGE">신뢰감</option>
                                <option value="SHIMMER">경쾌함</option>
                                <option value="VERSE">우아함</option>
                                <option value="MARIN">명랑함</option>
                                <option value="CEDAR">권위적</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>난이도</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            >
                                <option value="EASY">쉬움</option>
                                <option value="MEDIUM">보통</option>
                                <option value="HARD">어려움</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>카테고리</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="WORK">업무</option>
                                <option value="RELATIONSHIP">일상</option>
                                <option value="FAMILY">가족</option>
                                <option value="FRIEND">친구</option>
                            </select>
                        </div>
                    </div>
                </form>
                <div className={styles.buttonContainer}>
                    <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                        취소
                    </button>
                    <button type="submit" form="createScenarioForm" className={styles.submitButton}>
                        생성하기
                    </button>
                </div>
        </div>
    );
};

export default CreateScenarioPage;