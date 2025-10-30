// src/pages/User/MyProfilePage.jsx
import styles from './MyProfilePage.module.scss';
import { useAuthStore, useAuthUser } from '@/stores/authStore';
import FeedbackHistory from '@/components/User/feedback/FeedbackHistory';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 마이 프로필 페이지
 * 사용자 정보 + 피드백 히스토리
 */
const MyProfilePage = () => {
    const navigate = useNavigate();
    const user = useAuthUser();
    const status = useAuthStore((s) => s.status);
    const fetchUser = useAuthStore((s) => s.fetchUser);

    // 디버깅 로그
    useEffect(() => {
        console.log('MyProfilePage - status:', status);
        console.log('MyProfilePage - user:', user);
    }, [status, user]);

    // 인증되지 않은 경우 로그인 페이지로
    useEffect(() => {
        if (status === 'unauthenticated') {
            navigate('/login', { replace: true });
        }
    }, [status, navigate]);

    // 사용자 정보 다시 가져오기 시도
    useEffect(() => {
        if (!user) {
            console.log('사용자 정보 다시 가져오기 시도...');
            fetchUser().catch(err => {
                console.error('사용자 정보 가져오기 실패:', err);
            });
        }
    }, [user, fetchUser]);

    // 사용자 정보 로딩 중
    if (!user) {
        return <LoadingOverlay fullscreen message="사용자 정보를 불러오는 중..." />;
    }

    return (
        <div className={styles['my-profile-page']}>
            <div className={styles['my-profile-page__container']}>
                {/* 프로필 헤더 */}
                <div className={styles['my-profile-page__header']}>
                    <h1 className={styles['my-profile-page__title']}>마이 페이지</h1>
                    <div className={styles['my-profile-page__user-info']}>
                        <p className={styles['my-profile-page__user-name']}>{user.name}님</p>
                        <p className={styles['my-profile-page__user-email']}>{user.email}</p>
                    </div>
                </div>

                {/* 피드백 히스토리 */}
                <div className={styles['my-profile-page__content']}>
                    <FeedbackHistory />
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;