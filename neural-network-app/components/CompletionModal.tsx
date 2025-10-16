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
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!neuron) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fadeIn">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: [
                  '#4a9dff',
                  '#6aba8a',
                  '#9abd5a',
                  '#ffff88',
                  '#6abfff',
                  '#8adaaa'
                ][Math.floor(Math.random() * 6)]
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 p-10 border-4 border-emerald-400 animate-scaleIn relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent animate-pulse-slow pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-block mb-6 animate-bounce-slow">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
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
              Felicidades!
            </h2>

            <p className="text-2xl text-emerald-200 mb-6">
              Has dominado completamente
            </p>

            <div className="inline-block px-8 py-4 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/50 mb-8">
              <p className="text-3xl font-bold text-white">
                {neuron.label}
              </p>
            </div>

            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent to-emerald-400 rounded" />
              <div className="text-emerald-300 text-xl">
                100% Completado
              </div>
              <div className="h-1 w-16 bg-gradient-to-l from-transparent to-emerald-400 rounded" />
            </div>

            {unlockedNeurons.length > 0 && (
              <div className="bg-blue-900/40 border-2 border-blue-400 rounded-2xl p-6 mb-8 animate-slideUp">
                <p className="text-blue-300 text-lg mb-3">
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
              className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xl font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-emerald-500/50"
            >
              Continuar
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
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

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
            text-shadow: 0 0 20px rgba(16, 185, 129, 0.8),
                         0 0 40px rgba(16, 185, 129, 0.6),
                         0 0 60px rgba(16, 185, 129, 0.4);
          }
          50% {
            text-shadow: 0 0 30px rgba(16, 185, 129, 1),
                         0 0 60px rgba(16, 185, 129, 0.8),
                         0 0 90px rgba(16, 185, 129, 0.6);
          }
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
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

        .confetti {
          width: 10px;
          height: 10px;
          animation: fall linear forwards;
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
