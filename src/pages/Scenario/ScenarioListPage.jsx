import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiPlay, FiTrash2, FiClock, FiUser } from 'react-icons/fi';
import useScenarioStore from '../../stores/scenarioStore';
import styles from './ScenarioListPage.module.scss';

/**
 * 시나리오 선택 페이지
 * - 기본 시나리오 표시
 * - 사용자 커스텀 시나리오 표시
 * - 시나리오 생성 기능
 */
const ScenarioListPage = () => {
    const navigate = useNavigate();
    const {
        defaultScenarios,
        userScenarios,
        loading,
        error,
        fetchDefaultScenarios,
        fetchUserScenarios,
        deleteScenario,
        setSelectedScenario,
    } = useScenarioStore();

    const [activeTab, setActiveTab] = useState('default'); // 'default' | 'custom'
    const [showCreateModal, setShowCreateModal] = useState(false);

    // TODO: authStore에서 가져올 userId (임시로 1 사용)
    const userId = 1;

    useEffect(() => {
        fetchDefaultScenarios();
        fetchUserScenarios(userId);
    }, [fetchDefaultScenarios, fetchUserScenarios]);

    const handleScenarioClick = (scenario) => {
        setSelectedScenario(scenario);
        navigate(`/scenarios/${scenario.id}`);
    };

    const handleStartDialogue = (scenario) => {
        setSelectedScenario(scenario);
        navigate('/dialogue', { state: { scenarioId: scenario.id } });
    };

    const handleDeleteScenario = async (e, scenarioId) => {
        e.stopPropagation();
        if (window.confirm('정말 이 시나리오를 삭제하시겠습니까?')) {
            try {
                await deleteScenario(userId, scenarioId);
                alert('시나리오가 삭제되었습니다.');
            } catch (error) {
                alert('시나리오 삭제에 실패했습니다.');
            }
        }
    };

    const getDifficultyLabel = (difficulty) => {
        const labels = {
            EASY: '쉬움',
            MEDIUM: '보통',
            HARD: '어려움',
        };
        return labels[difficulty] || difficulty;
    };

    const getDifficultyClass = (difficulty) => {
        const classes = {
            EASY: styles.easy,
            MEDIUM: styles.medium,
            HARD: styles.hard,
        };
        return classes[difficulty] || '';
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                {/* 헤더 */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>시나리오 선택</h1>
                        <p className={styles.subtitle}>
                            대화 연습을 위한 시나리오를 선택하거나 직접 만들어보세요
                        </p>
                    </div>
                    <button
                        className={styles.createButton}
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FiPlus />
                        <span>새 시나리오 만들기</span>
                    </button>
                </header>

                {/* 탭 */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'default' ? styles.active : ''}`}
                        onClick={() => setActiveTab('default')}
                    >
                        기본 시나리오
                        <span className={styles.count}>{defaultScenarios.length}</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
                        onClick={() => setActiveTab('custom')}
                    >
                        내가 만든 시나리오
                        <span className={styles.count}>{userScenarios.length}</span>
                    </button>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {/* 로딩 */}
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>시나리오를 불러오는 중...</p>
                    </div>
                ) : (
                    <>
                        {/* 시나리오 목록 */}
                        {activeTab === 'default' && (
                            <div className={styles.scenarioGrid}>
                                {defaultScenarios.map((scenario) => (
                                    <div
                                        key={scenario.id}
                                        className={styles.scenarioCard}
                                        onClick={() => handleScenarioClick(scenario)}
                                    >
                                        <div className={styles.cardHeader}>
                                            <h3 className={styles.scenarioTitle}>
                                                {scenario.title}
                                            </h3>
                                            <span
                                                className={`${styles.difficultyBadge} ${getDifficultyClass(scenario.difficulty)}`}
                                            >
                                                {getDifficultyLabel(scenario.difficulty)}
                                            </span>
                                        </div>

                                        <p className={styles.scenarioDescription}>
                                            {scenario.description}
                                        </p>

                                        <div className={styles.scenarioMeta}>
                                            <div className={styles.metaItem}>
                                                <FiClock />
                                                <span>약 {scenario.estimatedDuration || 10}분</span>
                                            </div>
                                            {scenario.category && (
                                                <span className={styles.category}>
                                                    {scenario.category}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            className={styles.startButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartDialogue(scenario);
                                            }}
                                        >
                                            <FiPlay />
                                            <span>시작하기</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'custom' && (
                            <div className={styles.scenarioGrid}>
                                {userScenarios.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <p>아직 생성한 시나리오가 없습니다.</p>
                                        <button
                                            className={styles.emptyButton}
                                            onClick={() => setShowCreateModal(true)}
                                        >
                                            <FiPlus />
                                            <span>첫 시나리오 만들기</span>
                                        </button>
                                    </div>
                                ) : (
                                    userScenarios.map((scenario) => (
                                        <div
                                            key={scenario.id}
                                            className={`${styles.scenarioCard} ${styles.customCard}`}
                                            onClick={() => handleScenarioClick(scenario)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <div className={styles.headerLeft}>
                                                    <h3 className={styles.scenarioTitle}>
                                                        {scenario.title}
                                                    </h3>
                                                    <span className={styles.customBadge}>
                                                        <FiUser />
                                                        커스텀
                                                    </span>
                                                </div>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={(e) => handleDeleteScenario(e, scenario.id)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>

                                            <p className={styles.scenarioDescription}>
                                                {scenario.description}
                                            </p>

                                            <div className={styles.scenarioMeta}>
                                                <div className={styles.metaItem}>
                                                    <FiClock />
                                                    <span>약 {scenario.estimatedDuration || 10}분</span>
                                                </div>
                                                {scenario.difficulty && (
                                                    <span
                                                        className={`${styles.difficultyBadge} ${getDifficultyClass(scenario.difficulty)}`}
                                                    >
                                                        {getDifficultyLabel(scenario.difficulty)}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                className={styles.startButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartDialogue(scenario);
                                                }}
                                            >
                                                <FiPlay />
                                                <span>시작하기</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 시나리오 생성 모달 (별도 컴포넌트로 분리 권장) */}
            {showCreateModal && (
                <CreateScenarioModal
                    userId={userId}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
};

// 임시 모달 컴포넌트 (별도 파일로 분리 권장)
const CreateScenarioModal = ({ userId, onClose }) => {
    const { createScenario } = useScenarioStore();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        situation: '',
        counterpartyRole: '',
        difficulty: 'MEDIUM',
        category: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createScenario({
                ownerId: userId,
                ...formData,
            });
            alert('시나리오가 생성되었습니다!');
            onClose();
        } catch (error) {
            alert('시나리오 생성에 실패했습니다.');
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>새 시나리오 만들기</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
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
                            value={formData.situation}
                            onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                            placeholder="대화 상황을 자세히 설명해주세요"
                            rows={4}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>상대방 역할 *</label>
                        <input
                            type="text"
                            value={formData.counterpartyRole}
                            onChange={(e) => setFormData({ ...formData, counterpartyRole: e.target.value })}
                            placeholder="예: 팀장, 동료, 고객 등"
                            required
                        />
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
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="예: 업무, 일상 등"
                            />
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            취소
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            생성하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScenarioListPage;