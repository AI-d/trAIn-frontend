// src/components/User/feedback/FeedbackFilter.jsx
import styles from './FeedbackFilter.module.scss';

/**
 * 피드백 필터 컴포넌트
 */
const FeedbackFilter = ({ selectedGrade, sortOrder, onGradeChange, onSortChange }) => {
    const grades = ['ALL', 'A', 'B', 'C', 'D', 'F'];

    return (
        <div className={styles.filter}>
            {/* 등급 필터 */}
            <div className={styles.filter__section}>
                <label className={styles.filter__label}>등급</label>
                <div className={styles.filter__grades}>
                    {grades.map(grade => (
                        <button
                            key={grade}
                            className={`${styles.filter__grade_button} ${
                                selectedGrade === grade ? styles['filter__grade_button--active'] : ''
                            }`}
                            onClick={() => onGradeChange(grade)}
                        >
                            {grade === 'ALL' ? '전체' : grade}
                        </button>
                    ))}
                </div>
            </div>

            {/* 정렬 */}
            <div className={styles.filter__section}>
                <label className={styles.filter__label}>정렬</label>
                <select
                    className={styles.filter__select}
                    value={sortOrder}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="createdAt,desc">최신순</option>
                    <option value="createdAt,asc">오래된순</option>
                    <option value="totalScore,desc">점수 높은순</option>
                    <option value="totalScore,asc">점수 낮은순</option>
                </select>
            </div>
        </div>
    );
};

export default FeedbackFilter;
