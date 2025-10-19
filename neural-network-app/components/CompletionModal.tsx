'use client';

import { Neuron } from '@/domain/neuron.types';
import { useEffect, useState } from 'react';

interface CompletionModalProps {
  neuron: Neuron | null;
  unlockedNeurons: string[];
  onClose: () => void;
}

export default function CompletionModal({
  neuron,
  unlockedNeurons,
  onClose
}: CompletionModalProps) {

  if (!neuron) return null;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/50 flex flex-col justify-center items-center p-8 text-center overflow-y-auto relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 w-full">
        <div className="mb-8">
          <div className="inline-block mb-6 animate-bounce-slow">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50">
              <svg
                className="w-20 h-20 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-5xl font-bold text-white mb-4 animate-glow">
            ¡Felicidades!
          </h2>

          <p className="text-2xl text-blue-200 mb-6">
            Has dominado completamente
          </p>

          <div className="inline-block px-8 py-4 bg-gray-800 border-2 border-blue-500 rounded-2xl shadow-lg shadow-blue-500/50 mb-8">
            <p className="text-3xl font-bold text-white">
              {neuron.label}
            </p>
          </div>

          <div className="flex justify-center items-center gap-3 mb-8">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-blue-400 rounded" />
            <div className="text-blue-300 text-xl">
              100% Completado
            </div>
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-blue-400 rounded" />
          </div>

          {unlockedNeurons.length > 0 && (
            <div className="bg-gray-800/50 border-2 border-gray-700 rounded-2xl p-6 mb-8 animate-slideUp">
              <p className="text-gray-300 text-lg mb-3">
                Nuevas neuronas desbloqueadas:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {unlockedNeurons.map((neuronId, index) => (
                  <div
                    key={neuronId}
                    className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold shadow-lg shadow-blue-500/50 animate-popIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {neuronId.split('-').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-700 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-cyan-800 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/50"
          >
            Continuar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.8),
                         0 0 40px rgba(59, 130, 246, 0.6),
                         0 0 60px rgba(59, 130, 246, 0.4);
          }
          50% {
            text-shadow: 0 0 30px rgba(59, 130, 246, 1),
                         0 0 60px rgba(59, 130, 246, 0.8),
                         0 0 90px rgba(59, 130, 246, 0.6);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-popIn {
          animation: popIn 0.4s ease-out both;
        }

        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
