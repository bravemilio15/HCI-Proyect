'use client';

import { Neuron, Question } from '@/domain/neuron.types';
import { useState, useEffect } from 'react';

interface QuestionModalProps {
  neuron: Neuron | null;
  onAnswer: (answerIndex: number) => void;
  onClose: () => void;
  isCorrect: boolean | null;
  isAnswering: boolean;
}

export default function QuestionModal({
  neuron,
  onAnswer,
  onClose,
  isCorrect,
  isAnswering
}: QuestionModalProps) {
  useEffect(() => {
    if (isCorrect !== null && isCorrect) {
      const timer = setTimeout(() => {
        // La siguiente pregunta se cargará automáticamente
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

  const handleSubmit = () => {
    if (isAnswering) return;
    onAnswer(0);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {neuron.label}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl font-bold"
            disabled={isAnswering}
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <span className="text-gray-400 font-semibold">
            Pregunta {questionNumber} de {totalQuestions}
          </span>
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-8 flex-1">
        <p className="text-xl text-gray-200 leading-relaxed mb-8">
          {currentQuestion.question}
        </p>

        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            disabled={isAnswering}
            className={`w-full p-6 rounded-xl text-left transition-all duration-300 transform ${
              isAnswering
                ? 'bg-gray-700 border-2 border-gray-600 text-gray-400 cursor-wait'
                : 'bg-gray-700 border-2 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500 hover:scale-102 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white font-bold text-lg">
                A
              </span>
              <span className="flex-1 text-lg">{currentQuestion.options[0]}</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="text-gray-500 text-sm">
          Haz clic en la respuesta para continuar
        </div>
      </div>

      <style jsx>{`
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
