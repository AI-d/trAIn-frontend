// src/components/Auth/LoginForm.jsx

import {StepIndicator} from './common/StepIndicator';

export function SignupNavigation({
                                     currentStep,
                                     onPrevious,
                                     onNext,
                                     canGoNext = false,
                                     canGoPrevious = true,
                                     loading = false
                                 }) {
    return (
        <div className="signup-navigation">
            <StepIndicator currentStep={currentStep} totalSteps={2}/>

            <div className="signup-navigation__buttons">
                {currentStep > 1 && (
                    <button
                        type="button"
                        className="signup-navigation__btn signup-navigation__btn--previous"
                        onClick={onPrevious}
                        disabled={!canGoPrevious || loading}
                    >
                        이전
                    </button>
                )}

                {currentStep < 2 && (
                    <button
                        type="button"
                        className="signup-navigation__btn signup-navigation__btn--next"
                        onClick={onNext}
                        disabled={!canGoNext || loading}
                    >
                        다음
                    </button>
                )}
            </div>
        </div>
    );
}
