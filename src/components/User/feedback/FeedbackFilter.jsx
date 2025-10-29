// src/components/User/feedback/FeedbackFilter.jsx
// import styles from './FeedbackFilter.module.scss';
import React from 'react';

/**
 * 피드백 필터/정렬 컴포넌트
 *
 * @param {string} selectedGrade - 선택된 등급 ('ALL' | 'A' | 'B' | 'C' | 'D' | 'F')
 * @param {string} sortOrder - 정렬 순서 ('createdAt,desc' | 'createdAt,asc' | 'overallScore,desc' | 'overallScore,asc')
 * @param {function} onGradeChange - 등급 필터 변경 핸들러
 * @param {function} onSortChange - 정렬 변경 핸들러
 */
const FeedbackFilter = ({selectedGrade, sortOrder, onGradeChange, onSortChange}) => {
    const grades = [
        {value: 'ALL', label: '전체'},
        {value: 'A', label: 'A (90점 이상)'},
        {value: 'B', label: 'B (70-89점)'},
        {value: 'C', label: 'C (50-69점)'},
        {value: 'D', label: 'D (30-49점)'},
        {value: 'F', label: 'F (30점 미만)'},
    ];

    const sortOptions = [
        {value: 'createdAt,desc', label: '최신순'},
        {value: 'createdAt,asc', label: '오래된순'},
        {value: 'overallScore,desc', label: '점수 높은순'},
        {value: 'overallScore,asc', label: '점수 낮은순'},
    ];

    return (
        <div className="feedback-filter">
            {/* 등급 필터 */}
            <div className="feedback-filter__section">
                <label className="feedback-filter__label">등급 필터</label>
                <div className="feedback-filter__grade-buttons">
                    {grades.map(grade => (
                        <button
                            key={grade.value}
                            className={`feedback-filter__grade-button ${
                                selectedGrade === grade.value ? 'feedback-filter__grade-button--active' : ''
                            }`}
                            onClick={() => onGradeChange(grade.value)}
                        >
                            {grade.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 정렬 */}
            <div className="feedback-filter__section">
                <label className="feedback-filter__label" htmlFor="sort-select">
                    정렬
                </label>
                <select
                    id="sort-select"
                    className="feedback-filter__sort-select"
                    value={sortOrder}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FeedbackFilter;