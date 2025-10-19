'use client';

import { Neuron, Question } from '@/domain/neuron.types';
import { useState, useEffect, memo } from 'react';

interface QuestionModalProps {
  neuron: Neuron | null;
  onAnswer: (answerIndex: number) => void;
  onClose: () => void;
  isCorrect: boolean | null;
  isAnswering: boolean;
  onBack: () => void;
  isFirstQuestion: boolean;
  onRequestHint: () => void;
  isFetchingHint: boolean;
  hint: string | null;
  incorrectAnswerIndex: number | null;
  onTryAgain: () => void;
}

const QuestionModal = memo(function QuestionModal({
  neuron,
  onAnswer,
  onClose,
  isCorrect,
  isAnswering,
  onBack,
  onRequestHint,
  isFetchingHint,
  hint,
  incorrectAnswerIndex,
  onTryAgain
}: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    // Reset local selection when the parent indicates the question is done
    if (isCorrect !== null) {
      const timer = setTimeout(() => {
        if (isCorrect) {
          setSelectedAnswer(null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  if (!neuron) return null;

  const currentQuestion: Question | undefined = neuron.questions[neuron.currentQuestionIndex];

  if (!currentQuestion) return null;

  const questionNumber = neuron.currentQuestionIndex + 1;
  const totalQuestions = neuron.questions.length;
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  const handleAnswerClick = (answerIndex: number) => {
    if (isAnswering || isFetchingHint) return;
    setSelectedAnswer(answerIndex);
    onAnswer(answerIndex);
  };

  const showHintButton = isCorrect === false && hint === null && !isFetchingHint;

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="mb-4 md:mb-6">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">
            {neuron.label}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl md:text-2xl font-bold"
            disabled={isAnswering}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-2">
          <span className="text-gray-400 font-semibold text-sm md:text-base whitespace-nowrap">
            Pregunta {questionNumber} de {totalQuestions}
          </span>
          <div className="w-full md:flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 md:mb-8 flex-1 overflow-y-auto">
        <p className="text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed mb-4 md:mb-8">
          {currentQuestion.question}
        </p>

        <div className="space-y-3 md:space-y-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isIncorrectlyAnswered = incorrectAnswerIndex === index;

            const showAsCorrect = isSelected && isCorrect === true;
            const showAsIncorrect = (isSelected && isCorrect === false) || (isIncorrectlyAnswered && isCorrect === false);

            let buttonClasses = 'w-full p-3 md:p-4 lg:p-6 rounded-lg md:rounded-xl text-left transition-all duration-300 transform ';

            if (showAsCorrect) {
              buttonClasses += 'bg-green-700 border-2 border-green-500 text-white shadow-lg shadow-green-500/50';
            } else if (showAsIncorrect) {
              buttonClasses += 'bg-red-700 border-2 border-red-500 text-white shadow-lg shadow-red-500/50';
            } else if (isAnswering || isFetchingHint) {
              buttonClasses += 'bg-gray-700 border-2 border-gray-600 text-gray-400 cursor-wait';
            } else {
              buttonClasses += 'bg-gray-700 border-2 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500 hover:scale-102 cursor-pointer';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={isAnswering || isCorrect !== null || isFetchingHint}
                className={buttonClasses}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 text-white font-bold text-sm md:text-base lg:text-lg flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-sm md:text-base lg:text-lg">{option}</span>
                  {showAsCorrect && <span className="text-xl md:text-2xl flex-shrink-0">✓</span>}
                  {showAsIncorrect && <span className="text-xl md:text-2xl flex-shrink-0">✗</span>}
                </div>
              </button>
            );
          })}
        </div>

        {isCorrect === false && (
          <div className="mt-4 md:mt-6 text-center p-3 md:p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            {showHintButton && (
              <button onClick={onRequestHint} className="text-white font-semibold bg-gray-600 hover:bg-gray-500 px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base">
                Respuesta incorrecta. ¿Quieres una pista de Axon?
              </button>
            )}
            {isFetchingHint && (
              <p className="text-gray-400 animate-pulse text-sm md:text-base">Axon está generando una pista...</p>
            )}
            {hint && (
              <div className="text-left">
                <p className="text-gray-300 font-semibold mb-2 text-sm md:text-base">Pista de Axon:</p>
                <p className="text-gray-400 italic text-sm md:text-base">{hint}</p>
                <button onClick={onTryAgain} className="mt-3 md:mt-4 text-white font-semibold bg-gray-600 hover:bg-gray-500 px-4 md:px-6 py-2 rounded-lg transition-colors w-full text-sm md:text-base">
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 mt-auto pt-3 md:pt-4 border-t border-gray-700/50">
        <div>
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            disabled={isAnswering}
          >
            &larr; Volver a la introducción
          </button>
        </div>
        <div className="text-gray-500 text-xs md:text-sm">
          {isCorrect === null && 'Haz clic en la respuesta para continuar'}
          {hint && 'Ahora, intenta responder de nuevo'}
        </div>
      </div>

      <style jsx>{`
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
});

export default QuestionModal;
