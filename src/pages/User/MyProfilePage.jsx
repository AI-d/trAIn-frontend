// src/pages/User/MyProfilePage.jsx

import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuthStore, useAuthUser} from '@/stores/authStore';
import {ProfileForm} from '@/components/User/ProfileForm';
import {FeedbackHistory} from '@/components/User/FeedbackHistory';
import * as userService from '@/services/userService';
import * as feedbackService from '@/services/feedbackService';

export function MyProfilePage() {
    const navigate = useNavigate();
    const user = useAuthUser();
    const {logout} = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadFeedbackStats();
        }
    }, [user]);

    const loadFeedbackStats = async () => {
        try {
            const response = await feedbackService.getFeedbackStats(user.userId);
            setStats(response);
        } catch (error) {
            console.error('Failed to load feedback stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleProfileSave = async (profileData) => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await userService.updateMyProfile(profileData);
            setSuccessMessage('프로필이 성공적으로 저장되었습니다');

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || '프로필 저장 중 오류가 발생했습니다');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            await logout();
            navigate('/login');
        }
    };

    const handlePasswordChange = () => {
        navigate('/password-change');
    };

    const handleBack = () => {
        navigate('/');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="profile-page">
            <header className="profile-page__header">
                <button
                    className="profile-page__back-btn"
                    onClick={handleBack}
                    type="button"
                >
                    ← 뒤로
                </button>
                <h1 className="profile-page__title">내 프로필</h1>
                <button
                    className="profile-page__logout-btn"
                    onClick={handleLogout}
                    type="button"
                >
                    로그아웃
                </button>
            </header>

            <main className="profile-page__main">
                <div className="profile-page__container">
                    <div className="profile-page__sections">

                        <section className="profile-section">
                            <h2 className="profile-section__title">기본 정보</h2>

                            {successMessage && (
                                <div className="profile-page__success">
                                    {successMessage}
                                </div>
                            )}

                            <ProfileForm
                                user={user}
                                onSave={handleProfileSave}
                                loading={loading}
                                error={error}
                            />

                            {user.provider === 'LOCAL' && (
                                <div className="profile-section__password">
                                    <button
                                        className="profile-section__password-btn"
                                        onClick={handlePasswordChange}
                                        type="button"
                                    >
                                        비밀번호 변경
                                    </button>
                                </div>
                            )}
                        </section>

                        <section className="profile-section">
                            <h2 className="profile-section__title">나의 피드백 통계</h2>

                            {statsLoading ? (
                                <div className="feedback-stats__loading">통계를 불러오는 중...</div>
                            ) : stats ? (
                                <div className="feedback-stats">
                                    <div className="feedback-stats__grid">
                                        <div className="stat-card">
                                            <span className="stat-card__label">평균 점수</span>
                                            <span className="stat-card__value">{stats.averageScore || 0}점</span>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-card__label">최고 점수</span>
                                            <span className="stat-card__value">{stats.maxScore || 0}점</span>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-card__label">총 연습 횟수</span>
                                            <span className="stat-card__value">{stats.totalCount || 0}회</span>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-card__label">최근 점수</span>
                                            <span className="stat-card__value">{stats.recentScore || 0}점</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="feedback-stats__empty">
                                    <p>아직 피드백 통계가 없습니다</p>
                                </div>
                            )}
                        </section>

                        <section className="profile-section">
                            <FeedbackHistory userId={user.userId}/>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}
