'use client';

import { Neuron } from '@/domain/neuron.types';

interface IntroductionModalProps {
  neuron: Neuron | null;
  onStart: () => void;
  onClose: () => void;
}

export default function IntroductionModal({
  neuron,
  onStart,
  onClose
}: IntroductionModalProps) {
  if (!neuron) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 p-12 border-2 border-gray-600 animate-scaleIn">
        <div className="text-center">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors text-3xl font-bold"
          >
            ×
          </button>

          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">
              Tema: {neuron.label}
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
          </div>

          <div className="mb-10 text-gray-300 text-lg leading-relaxed space-y-4">
            <p>
              Bienvenido al módulo de aprendizaje sobre <span className="text-white font-semibold">{neuron.label}</span>.
            </p>
            <p>
              En este tema aprenderás los conceptos fundamentales de cómo funcionan las variables en JavaScript,
              incluyendo su declaración, asignación y alcance.
            </p>
            <p className="text-white font-semibold">
              Completa {neuron.questions.length} preguntas para dominar este concepto.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gray-700 text-white text-lg font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={onStart}
              className="px-10 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xl font-bold rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-700/50"
            >
              Comenzar
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
