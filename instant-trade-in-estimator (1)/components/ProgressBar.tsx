
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
}

const steps = ["Boat Info", "Condition", "Contact", "Estimate"];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold
                    ${isCompleted ? 'bg-blue-600 text-white' : ''}
                    ${isActive ? 'bg-blue-600 text-white scale-110' : ''}
                    ${!isCompleted && !isActive ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {stepNumber}
                </div>
                <p className={`mt-2 text-xs text-center font-medium transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-auto border-t-2 transition-colors duration-300 mx-2
                  ${isCompleted ? 'border-blue-600' : 'border-gray-200'}
                `}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
