// src/components/Auth/common/StepIndicator.jsx

export function StepIndicator({currentStep = 1, totalSteps = 2}) {
    return (
        <div className="step-indicator">
            <div className="step-indicator__progress">
                <div
                    className="step-indicator__progress-bar"
                    style={{width: `${(currentStep / totalSteps) * 100}%`}}
                />
            </div>
            <div className="step-indicator__text">
                {currentStep} / {totalSteps}
            </div>
        </div>
    );
}
