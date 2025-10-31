// src/components/common/LoadingOverlay.jsx
import styles from './LoadingOverlay.module.scss';

const LoadingOverlay = ({ message = '로딩 중...', fullscreen = false }) => {
    return (
        <div className={`${styles.overlay} ${fullscreen ? styles['overlay--fullscreen'] : ''}`}>
            <div className={styles.overlay__content}>
                <div className={styles.overlay__spinner} />
                <p className={styles.overlay__message}>{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
