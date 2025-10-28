// src/components/Auth/SignupStep1.jsx

import {useEffect, useState} from 'react';

export function SignupStep1({value = [], onChange}) {
    const [terms, setTerms] = useState([]);
    const [consents, setConsents] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTerms, setSelectedTerms] = useState(null);

    useEffect(() => {
        loadTerms();
    }, []);

    const loadTerms = async () => {
        try {
            const mockTerms = [
                {
                    termsId: 'TERMS_OF_SERVICE',
                    title: '서비스 이용약관',
                    version: '1.0',
                    required: true,
                    content: '서비스 이용약관 내용...'
                },
                {
                    termsId: 'PRIVACY_POLICY',
                    title: '개인정보 처리방침',
                    version: '1.0',
                    required: true,
                    content: '개인정보 처리방침 내용...'
                },
                {
                    termsId: 'MARKETING_CONSENT',
                    title: '마케팅 정보 수신 동의',
                    version: '1.0',
                    required: false,
                    content: '마케팅 정보 수신 동의 내용...'
                }
            ];

            setTerms(mockTerms);

            const initialConsents = mockTerms.map(term => ({
                termsId: term.termsId,
                version: term.version,
                agreed: false,
                required: term.required
            }));

            setConsents(initialConsents);
            onChange(initialConsents);
        } catch (error) {
            console.error('Failed to load terms:', error);
        }
    };

    const handleTermsChange = (termsId, checked) => {
        const updatedConsents = consents.map(consent =>
            consent.termsId === termsId ? {...consent, agreed: checked} : consent
        );

        setConsents(updatedConsents);
        onChange(updatedConsents);
    };

    const handleAgreeAll = (checked) => {
        const updatedConsents = consents.map(consent => ({
            ...consent,
            agreed: checked
        }));

        setConsents(updatedConsents);
        onChange(updatedConsents);
    };

    const handleDetailClick = (termsId) => {
        const term = terms.find(t => t.termsId === termsId);
        setSelectedTerms(term);
        setShowDetailModal(true);
    };

    const allChecked = consents.every(consent => consent.agreed);
    const requiredChecked = consents.filter(c => c.required).every(c => c.agreed);

    return (
        <div className="signup-step1">
            <h2 className="signup-step1__title">약관 동의</h2>

            <div className="signup-step1__agree-all">
                <label className="checkbox-label checkbox-label--agree-all">
                    <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => handleAgreeAll(e.target.checked)}
                    />
                    <span className="checkbox-label__text">전체 동의</span>
                </label>
            </div>

            <div className="signup-step1__terms-list">
                {terms.map(term => {
                    const consent = consents.find(c => c.termsId === term.termsId);
                    return (
                        <div key={term.termsId} className="terms-item">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={consent?.agreed || false}
                                    onChange={(e) => handleTermsChange(term.termsId, e.target.checked)}
                                />
                                <span className="checkbox-label__text">
                  {term.required && <span className="required-mark">*</span>}
                                    {term.title}
                </span>
                            </label>
                            <button
                                type="button"
                                className="terms-item__detail-btn"
                                onClick={() => handleDetailClick(term.termsId)}
                            >
                                보기
                            </button>
                        </div>
                    );
                })}
            </div>

            {showDetailModal && selectedTerms && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3>{selectedTerms.title}</h3>
                            <button
                                type="button"
                                className="modal__close"
                                onClick={() => setShowDetailModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal__content">
                            {selectedTerms.content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
