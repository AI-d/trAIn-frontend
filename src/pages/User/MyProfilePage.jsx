// src/pages/User/MyProfilePage.jsx
// import styles from './MyProfilePage.module.scss';
import React from 'react';
import {useAuthUser} from '@/stores/authStore';
import FeedbackHistory from '@/components/User/feedback/FeedbackHistory';
import LoadingOverlay from '@/components/common/LoadingOverlay';

/**
 * 마이 프로필 페이지
 * 사용자 정보 + 피드백 히스토리
 */
const MyProfilePage = () => {
    const user = useAuthUser();

    // 사용자 정보 로딩 중
    if (!user) {
        return <LoadingOverlay fullscreen message="사용자 정보를 불러오는 중..."/>;
    }

    return (
        <div className="my-profile-page">
            <div className="my-profile-page__container">
                {/* 프로필 헤더 */}
                <div className="my-profile-page__header">
                    <h1 className="my-profile-page__title">마이 페이지</h1>
                    <div className="my-profile-page__user-info">
                        <p className="my-profile-page__user-name">{user.name}님</p>
                        <p className="my-profile-page__user-email">{user.email}</p>
                    </div>
                </div>

                {/* 피드백 히스토리 */}
                <div className="my-profile-page__content">
                    <FeedbackHistory/>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;