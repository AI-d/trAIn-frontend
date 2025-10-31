// src/components/Header/AppHeader.jsx
import styles from './AppHeader.module.scss';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useAuthUser } from '@/stores/authStore';
import { FiUser, FiLogOut } from 'react-icons/fi';

const AppHeader = () => {
    const navigate = useNavigate();
    const user = useAuthUser();
    const logout = useAuthStore((s) => s.logout);
    const status = useAuthStore((s) => s.status);

    const handleLogout = async () => {
        const confirmed = window.confirm('로그아웃 하시겠습니까?');
        if (!confirmed) return;

        await logout();
        navigate('/', { replace: true });
    };

    const handleMyPage = () => {
        navigate('/my-profile');
    };

    // 인증되지 않은 경우에만 헤더 숨김
    if (status === 'unauthenticated') return null;

    return (
        <header className={styles.header}>
            <div className={styles.header__container}>
                <div className={styles.header__logo} onClick={() => navigate('/scenarios')}>
                    <h1 className={styles.header__title}>Dialogym</h1>
                </div>

                <div className={styles.header__actions}>
                    {user && (
                        <span className={styles.header__username}>{user.name}님</span>
                    )}

                    <button
                        className={styles.header__button}
                        onClick={handleMyPage}
                        title="마이 페이지"
                    >
                        <FiUser size={20} />
                    </button>

                    <button
                        className={styles.header__button}
                        onClick={handleLogout}
                        title="로그아웃"
                    >
                        <FiLogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
