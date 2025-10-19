'use client';

import { useState, memo, useMemo } from 'react';
import { TUTORIAL_STEPS } from '@/shared/constants/tutorial.constants';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente para parsear y renderizar el contenido
const TutorialContent = ({ content }: { content: string }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        if (line.startsWith('- ')) {
          const parts = line.substring(2).split('**');
          return (
            <div key={index} className="flex items-start">
              <span className="text-blue-400 mr-3 mt-1">&#9679;</span>
              <p className="flex-1">
                {parts.map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="font-bold text-white">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            </div>
          );
        }
        const parts = line.split('**');
        return (
          <p key={index}>
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-bold text-blue-400">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
};

const TutorialModal = memo(function TutorialModal({
  isOpen,
  onClose,
}: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // Finaliza el tutorial
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-gray-800/80 border border-gray-700 rounded-2xl shadow-2xl flex flex-col p-6 md:p-8 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-3xl font-light z-10"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            {step.title}
          </h2>
        </div>

        <div className="text-base md:text-lg text-gray-300 leading-relaxed mb-8 min-h-[150px]">
          <TutorialContent content={step.content} />
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4 sm:gap-2">
          <div className="flex-1 flex justify-start">
            <button
              onClick={handlePrev}
              className={`px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all ${currentStep === 0 ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
              disabled={currentStep === 0}
            >
              Anterior
            </button>
          </div>

          <div className="text-sm text-gray-400 order-first sm:order-none">
            Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
          </div>

          <div className="flex-1 flex justify-end">
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-700/30"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TutorialModal;
