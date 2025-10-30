// src/components/common/ErrorMessage.jsx
import styles from './ErrorMessage.module.scss';

const ErrorMessage = ({ message, type = 'error' }) => {
    return (
        <div className={`${styles.message} ${styles[`message--${type}`]}`}>
            <p className={styles.message__text}>{message}</p>
        </div>
    );
};

export default ErrorMessage;
