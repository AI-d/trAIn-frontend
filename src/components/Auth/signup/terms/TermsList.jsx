// src/components/Auth/signup/terms/TermsList.jsx
// import styles from './TermsList.module.scss';
import React, {useEffect, useState} from 'react';
import AgreeAllCheckbox from './AgreeAllCheckbox';
import TermsItem from './TermsItem';
import * as termsService from '@/services/termsService';

/**
 * 약관 목록 컴포넌트
 *
 * @param {Array} consents - 약관 동의 상태 배열 [{termsId, version, agreed}]
 * @param {function} onConsentsChange - 약관 동의 변경 핸들러
 * @param {function} onViewDetail - 약관 상세 보기 핸들러
 */
const TermsList = ({consents, onConsentsChange, onViewDetail}) => {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 약관 목록 불러오기
    useEffect(() => {
        const fetchTerms = async () => {
            try {
                setLoading(true);
                const activeTerms = await termsService.getActiveTerms();
                setTerms(activeTerms);

                // 초기 consents 배열 생성 (모두 미동의 상태)
                const initialConsents = activeTerms.map(term => ({
                    termsId: term.termsId,
                    version: term.version,
                    agreed: false,
                }));
                onConsentsChange(initialConsents);
            } catch (err) {
                console.error('약관 목록 로딩 실패:', err);
                setError('약관 목록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchTerms();
    }, []);

    // 전체 동의 여부 계산
    const allAgreed = consents.length > 0 && consents.every(c => c.agreed);

    // 개별 약관 동의 변경
    const handleTermChange = (termsId, agreed) => {
        const updatedConsents = consents.map(consent =>
            consent.termsId === termsId
                ? {...consent, agreed}
                : consent
        );
        onConsentsChange(updatedConsents);
    };

    // 전체 동의 토글
    const handleToggleAll = (agreed) => {
        const updatedConsents = consents.map(consent => ({
            ...consent,
            agreed,
        }));
        onConsentsChange(updatedConsents);
    };

    if (loading) {
        return (
            <div className="terms-list__loading">
                약관을 불러오는 중...
            </div>
        );
    }

    if (error) {
        return (
            <div className="terms-list__error">
                {error}
            </div>
        );
    }

    return (
        <div className="terms-list">
            {/* 전체 동의 */}
            <AgreeAllCheckbox
                allAgreed={allAgreed}
                onToggleAll={handleToggleAll}
            />

            {/* 구분선 */}
            <div className="terms-list__divider"/>

            {/* 개별 약관 목록 */}
            <div className="terms-list__items">
                {terms.map(term => {
                    const consent = consents.find(c => c.termsId === term.termsId);
                    return (
                        <TermsItem
                            key={term.termsId}
                            term={term}
                            checked={consent?.agreed || false}
                            onChange={handleTermChange}
                            onViewDetail={onViewDetail}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TermsList;