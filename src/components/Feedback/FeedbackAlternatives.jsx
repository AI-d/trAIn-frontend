// src/components/Feedback/FeedbackAlternatives.jsx
import styles from './FeedbackAlternatives.module.scss';
import { useState, useEffect } from 'react';

/**
 * 피드백 개선안 컴포넌트
 */
const FeedbackAlternatives = (props) => {
    const { alternatives, chosenAlternative, onChoose, onViewDetail } = props;
    const [selectedChoice, setSelectedChoice] = useState(chosenAlternative || null);

    // chosenAlternative가 변경되면 selectedChoice 업데이트
    useEffect(() => {
        setSelectedChoice(chosenAlternative);
    }, [chosenAlternative]);

    const handleChoose = (choice) => {
        setSelectedChoice(choice);
        onChoose(choice);
    };

    const alternativesList = [
        { key: 'A', label: '개선안 A', content: alternatives?.alternativeA },
        { key: 'B', label: '개선안 B', content: alternatives?.alternativeB },
        { key: 'C', label: '개선안 C', content: alternatives?.alternativeC },
    ];

    return (
        <div className={styles['alternatives']}>
            <h3 className={styles['alternatives__title']}>개선안</h3>
            <p className={styles['alternatives__subtitle']}>
                가장 마음에 드는 개선안을 선택해주세요.
            </p>

            <div className={styles['alternatives__list']}>
                {alternativesList.map(({ key, label, content }) => (
                    content && (
                        <div
                            key={key}
                            className={`${styles['alternatives__item']} ${selectedChoice === key ? styles['alternatives__item--selected'] : ''
                                }`}
                        >
                            <div className={styles['alternatives__item-header']}>
                                <span className={styles['alternatives__item-label']}>{label}</span>
                                <div className={styles['alternatives__item-actions']}>
                                    {selectedChoice !== key && (
                                        <button
                                            className={styles['alternatives__item-button']}
                                            onClick={() => handleChoose(key)}
                                        >
                                            선택
                                        </button>
                                    )}
                                    {selectedChoice === key && (
                                        <>
                                            <span className={styles['alternatives__item-badge']}>선택됨</span>
                                            {onViewDetail && (
                                                <button
                                                    className={styles['alternatives__item-detail-button']}
                                                    onClick={() => onViewDetail(key)}
                                                >
                                                    자세히 보기
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <p className={styles['alternatives__item-content']}>{content}</p>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default FeedbackAlternatives;
