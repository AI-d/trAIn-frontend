// src/components/Feedback/FeedbackLoadingView.jsx
import styles from './FeedbackLoadingView.module.scss';

/**
 * 피드백 생성 중 로딩 화면
 */
const FeedbackLoadingView = () => {
    return (
        <div className={styles['loading-view']}>
            <div className={styles['loading-view__content']}>
                <div className={styles['loading-view__spinner']} />
                <h2 className={styles['loading-view__title']}>AI 피드백 생성 중...</h2>
                <p className={styles['loading-view__message']}>
                    대화 내용을 분석하고 있습니다.
                    <br />
                    잠시만 기다려주세요.
                </p>
            </div>
        </div>
    );
};

export default FeedbackLoadingView;
