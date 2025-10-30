import React, { useEffect, useState } from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
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

    // TODO: 시나리오 상세 조회 페이지 존재X, 생성되면 연결, 현재 기능 기준 필요 없음
    /*const handleScenarioClick = (scenario) => {
        setSelectedScenario(scenario);
        navigate(`/scenarios/${scenario.id}`);
    };*/

    const handleStartDialogue = (scenario) => {
        console.log('handleStartDialogue - scenario 객체:', scenario);
        console.log('handleStartDialogue - scenario.id:', scenario.id);
        console.log('handleStartDialogue - scenario의 모든 키:', Object.keys(scenario));
        
        setSelectedScenario(scenario);
        navigate('/dialogue', { state: {
            scenarioId: scenario.id,
            scenarioTitle: scenario.title
        } });
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
                    <NavLink
                        to = {'/create'}
                        className={styles.createButton}
                    >
                        새 시나리오 만들기
                    </NavLink>
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
                                        // onClick={() => handleScenarioClick(scenario)}
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
                                        <NavLink
                                            to = {'/create'}
                                            className={styles.emptyButton}
                                            userId = {userId}
                                        >
                                            첫 시나리오 만들기
                                        </NavLink>
                                    </div>
                                ) : (
                                    userScenarios.map((scenario) => (
                                        <div
                                            key={scenario.id}
                                            className={`${styles.scenarioCard} ${styles.customCard}`}
                                            // onClick={() => handleScenarioClick(scenario)}
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

            {/* 시나리오 생성 모달 (별도 컴포넌트로 분리 권장)
            {showCreateModal && (
                <CreateScenarioModal
                    userId={userId}
                    onClose={() => setShowCreateModal(false)}
                />
            )}*/}
        </div>
    );
};

export default ScenarioListPage;