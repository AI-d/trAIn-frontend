import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../../../../Downloads/AppHeader.module.scss';

/**
 * 공통 헤더 컴포넌트
 * - 로고 및 네비게이션
 * - 현재 페이지 활성화 표시
 */
const AppHeader = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* 로고 */}
                <Link to="/" className={styles.logo}>
                    <span className={styles.logoText}>Dialogym</span>
                </Link>

                {/* 네비게이션 */}
                <nav className={styles.nav}>
                    <Link
                        to="/scenarios"
                        className={`${styles.navLink} ${isActive('/scenarios') || isActive('/') ? styles.active : ''}`}
                    >
                        시나리오
                    </Link>
                    <Link
                        to="/profile"
                        className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''}`}
                    >
                        마이페이지
                    </Link>
                </nav>

                {/* 로그인 버튼 (추후 왕택준님이 구현) */}
                <div className={styles.userSection}>
                    <span className={styles.userName}>Guest</span>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;