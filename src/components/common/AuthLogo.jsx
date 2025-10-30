// src/components/common/AuthLogo.jsx
import styles from './AuthLogo.module.scss';
import {useNavigate} from 'react-router-dom';

/**
 * Auth 페이지용 로고 컴포넌트
 * 클릭하면 홈(/)으로 이동
 */
const AuthLogo = () => {
    const navigate = useNavigate();

    return (
        <button
            className={styles['auth-logo']}
            onClick={() => navigate('/')}
            type="button"
            aria-label="홈으로 이동"
        >
            <h1 className={styles['auth-logo__text']}>Dialogym</h1>
        </button>
    );
};

export default AuthLogo;
