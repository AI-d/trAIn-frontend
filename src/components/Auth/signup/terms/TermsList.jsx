// src/components/Auth/signup/terms/TermsList.jsx
// import styles from './TermsList.module.scss';
import React, {useEffect, useState} from 'react';
import AgreeAllCheckbox from './AgreeAllCheckbox';
import TermsItem from './TermsItem';
import * as termsService from '@/services/termsService';

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

                // 필수 약관 내에서도 이용약관 → 개인정보 순서
                const sortedTerms = activeTerms.sort((a, b) => {
                    // 1순위: 필수 여부 (필수가 먼저)
                    if (a.required && !b.required) return -1;
                    if (!a.required && b.required) return 1;

                    // 2순위: 필수 약관 내에서 이용약관이 먼저
                    if (a.required && b.required) {
                        // title에 "이용약관"이 포함되면 먼저
                        if (a.title.includes('이용약관')) return -1;
                        if (b.title.includes('이용약관')) return 1;
                        // 그 다음 개인정보
                        if (a.title.includes('개인정보')) return -1;
                        if (b.title.includes('개인정보')) return 1;
                    }

                    return 0;
                });

                setTerms(sortedTerms);

                // 초기 consents 배열 생성 (모두 미동의 상태)
                const initialConsents = sortedTerms.map(term => ({
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

            {/* 개별 약관 목록 (정렬된 순서대로) */}
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