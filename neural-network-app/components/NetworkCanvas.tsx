'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Neuron } from '@/domain/neuron.types';
import { UI_ANIMATION } from '@/shared/constants/network.constants';
import IntroductionModal from './IntroductionModal';
import QuestionModal from './QuestionModal';
import CompletionModal from './CompletionModal';
import ResetButton from './ResetButton';

const ThreeCanvas = dynamic(() => import('./ThreeCanvas'), {
  ssr: false,
  loading: () => <div className="text-white">Cargando visualizacion...</div>
});

export default function NetworkCanvas() {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNeuron, setSelectedNeuron] = useState<Neuron | null>(null);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<boolean | null>(null);
  const [unlockedNeurons, setUnlockedNeurons] = useState<string[]>([]);
  const [feedbackNeuronId, setFeedbackNeuronId] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [incorrectAnswerIndex, setIncorrectAnswerIndex] = useState<number | null>(null);
  const [lastHintRequestTime, setLastHintRequestTime] = useState(0);
  const HINT_REQUEST_COOLDOWN = 3000; // ✅ 3 segundos entre hints

  const fetchNetwork = useCallback(async () => {
    try {
      console.log('[NETWORK-CANVAS] Fetching network state from server...');
      const response = await fetch('/api/network');
      const data = await response.json();

      if (data.success) {
        setNeurons(data.data.neurons);
        setError(null);
      } else {
        setError('Failed to load network');
      }
    } catch (err) {
      setError('Error fetching network data');
      console.error('Error fetching network:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array ensures this function instance doesn't change

  useEffect(() => {
    // This effect runs only once on mount
    const savedState = localStorage.getItem('networkState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (Array.isArray(parsedState) && parsedState.length > 0) {
          console.log('[NETWORK-CANVAS] Loaded network state from localStorage.');
          setNeurons(parsedState);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('[NETWORK-CANVAS] Failed to parse saved state, fetching from server.', e);
      }
    }
    fetchNetwork();
  }, [fetchNetwork]);

  useEffect(() => {
    // This effect saves the state to localStorage with throttling (max once per second)
    if (neurons.length > 0 && !loading) {
      const timeoutId = setTimeout(() => {
        console.log('[NETWORK-CANVAS] Saving network state to localStorage.');
        localStorage.setItem('networkState', JSON.stringify(neurons));
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [neurons, loading]);

  useEffect(() => {
    // This effect syncs the selectedNeuron state with the main neurons array.
    // This is crucial for updating the question modal after an answer.
    if (selectedNeuron) {
      const updatedNeuron = neurons.find(n => n.id === selectedNeuron.id);
      if (updatedNeuron && JSON.stringify(updatedNeuron) !== JSON.stringify(selectedNeuron)) {
        setSelectedNeuron(updatedNeuron);
      }
    }
  }, [neurons, selectedNeuron]);

  const resetQuestionState = () => {
    setAnswerFeedback(null);
    setHint(null);
    setIsFetchingHint(false);
    setIncorrectAnswerIndex(null);
  };

  const handleNeuronClick = useCallback((neuronId: string) => {
    const targetNeuron = neurons.find(n => n.id === neuronId);
    if (!targetNeuron || (targetNeuron.status !== 'available' && targetNeuron.status !== 'in_progress')) {
      return;
    }

    if (targetNeuron.questions.length === 0) {
      console.warn('No questions available for this neuron');
      return;
    }

    setSelectedNeuron(targetNeuron);

    if (targetNeuron.progress === 0) {
      setShowIntroModal(true);
    } else {
      setShowQuestionPanel(true);
    }

    resetQuestionState();
  }, [neurons]);

  const handleStartQuestions = useCallback(() => {
    setShowIntroModal(false);
    setShowQuestionPanel(true);
  }, []);

  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (!selectedNeuron || isAnswering) return;

    // Reset hint/incorrect state from previous attempt
    setHint(null);
    setIncorrectAnswerIndex(null);

    setIsAnswering(true);

    try {
      const response = await fetch('/api/network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedNeuron.id,
          answerIndex
          // ✅ Optimización: Ya no enviamos todo el estado, el servidor lo maneja
        }),
      });

      const data = await response.json();
      setAnswerFeedback(data.isCorrect);

      if (data.success) {
        setFeedbackNeuronId(selectedNeuron.id);
        setFeedbackType(data.isCorrect ? 'correct' : 'incorrect');

        // The backend now returns the full updated state, so we can set it directly
        if (data.newState) {
          setNeurons(data.newState);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Let user see feedback

        if (data.isCorrect) {
          setAnswerFeedback(null); // Reset for next question

          if (data.isCompleted) {
            setUnlockedNeurons(data.unlockedNeurons || []);
            setShowQuestionPanel(false);
            setShowCompletionModal(true);
          }
        } else {
          // Incorrect answer flow
          setIncorrectAnswerIndex(answerIndex);
        }
      } else {
        setAnswerFeedback(false);
      }
    } catch (err) {
      setAnswerFeedback(false);
    } finally {
      setIsAnswering(false);
    }
  }, [selectedNeuron, isAnswering, fetchNetwork]);

  const handleRequestHint = useCallback(async () => {
    if (!selectedNeuron || incorrectAnswerIndex === null) return;

    // ✅ Rate limiting para hints
    const now = Date.now();
    const timeSinceLastRequest = now - lastHintRequestTime;
    if (timeSinceLastRequest < HINT_REQUEST_COOLDOWN) {
      const waitTime = Math.ceil((HINT_REQUEST_COOLDOWN - timeSinceLastRequest) / 1000);
      setHint(`Por favor espera ${waitTime} segundo${waitTime > 1 ? 's' : ''} antes de pedir otra pista.`);
      return;
    }

    setLastHintRequestTime(now);
    setIsFetchingHint(true);
    setHint(null);

    const currentQuestion = selectedNeuron.questions[selectedNeuron.currentQuestionIndex];
    const userAnswer = currentQuestion.options[incorrectAnswerIndex];
    const correctAnswer = currentQuestion.options[currentQuestion.correctAnswer];

    try {
      const response = await fetch('/api/chat/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer,
          correctAnswer,
          topic: selectedNeuron.label,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setHint(data.hint);
      } else {
        setHint('Lo siento, no pude generar una pista en este momento.');
      }
    } catch (error) {
      setHint('Error de conexión al solicitar la pista.');
    } finally {
      setIsFetchingHint(false);
    }
  }, [selectedNeuron, incorrectAnswerIndex]);

  const handleClosePanel = () => {
    setShowIntroModal(false);
    setShowQuestionPanel(false);
    setShowCompletionModal(false);
    setSelectedNeuron(null);
    resetQuestionState();
  }

  const handleCloseIntroModal = handleClosePanel;
  const handleCloseQuestionPanel = handleClosePanel;
  const handleCloseCompletionModal = handleClosePanel;

  const handleBackToIntro = useCallback(() => {
    setShowQuestionPanel(false);
    setShowIntroModal(true);
  }, []);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackNeuronId(null);
    setFeedbackType(null);
  }, []);

  const handleReset = useCallback(async () => {
    try {
      // Clear the localStorage before resetting the state
      localStorage.removeItem('networkState');
      console.log('[NETWORK-CANVAS] Cleared network state from localStorage.');

      const response = await fetch('/api/network/reset', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setNeurons(data.data.neurons);
        setSelectedNeuron(null);
        setShowIntroModal(false);
        setShowQuestionPanel(false);
        setShowCompletionModal(false);
        resetQuestionState();
      } else {
        console.error('[NETWORK-CANVAS] Failed to reset network:', data.error);
      }
    } catch (err) {
      console.error('[NETWORK-CANVAS] Error resetting network:', err);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-2xl">Cargando red neuronal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    );
  }

  const isPanelActive = showIntroModal || showQuestionPanel || showCompletionModal;
  const isPanelOpen = isPanelActive;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col md:flex-row">
      {/* Canvas Container - Mobile: 50% height top, Desktop: 60% width left */}
      <div className={`relative transition-all duration-500 ease-in-out ${isPanelOpen ? 'h-1/2 md:h-full w-full md:w-[60%]' : 'h-full w-full'}`}>
        <div className="absolute top-4 md:top-8 left-0 right-0 flex flex-col items-center z-10 pointer-events-none px-4">
          <h1 className="text-white text-xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-4 text-center">
            Red Neuronal de Aprendizaje
          </h1>
          <p className="text-gray-400 mb-2 md:mb-12 text-xs md:text-lg lg:text-xl text-center">
            Haz clic en una neurona para comenzar a aprender
          </p>
        </div>
        <ResetButton onReset={handleReset} />

        <ThreeCanvas
          neurons={neurons}
          onNeuronClick={handleNeuronClick}
          isPanelOpen={isPanelOpen}
          feedbackNeuronId={feedbackNeuronId}
          feedbackType={feedbackType}
          onFeedbackComplete={handleFeedbackComplete}
        />
      </div>

      {/* Panel Container - Mobile: 50% height bottom, Desktop: 40% width right */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            className="relative w-full h-1/2 md:h-full md:w-[40%] bg-gray-900 overflow-hidden"
            initial={{
              y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 0,
              x: typeof window !== 'undefined' && window.innerWidth >= 768 ? '100%' : 0,
              opacity: 0
            }}
            animate={{ y: 0, x: 0, opacity: 1 }}
            exit={{
              y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 0,
              x: typeof window !== 'undefined' && window.innerWidth >= 768 ? '100%' : 0,
              opacity: 0
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >

        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            {showIntroModal && selectedNeuron && (
              <motion.div
                key="intro"
                className="absolute inset-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <IntroductionModal
                  neuron={selectedNeuron}
                  onStart={handleStartQuestions}
                  onClose={handleCloseIntroModal}
                />
              </motion.div>
            )}

            {showQuestionPanel && selectedNeuron && (
              <motion.div
                key="question"
                className="absolute inset-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <QuestionModal
                  neuron={selectedNeuron}
                  onAnswer={handleAnswer}
                  onClose={handleCloseQuestionPanel}
                  isCorrect={answerFeedback}
                  isAnswering={isAnswering}
                  onBack={handleBackToIntro}
                  isFirstQuestion={selectedNeuron.currentQuestionIndex === 0}
                  onRequestHint={handleRequestHint}
                  isFetchingHint={isFetchingHint}
                  hint={hint}
                  incorrectAnswerIndex={incorrectAnswerIndex}
                  onTryAgain={resetQuestionState}
                />
              </motion.div>
            )}

            {showCompletionModal && selectedNeuron && (
              <motion.div
                key="completion"
                className="absolute inset-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <CompletionModal
                  neuron={selectedNeuron}
                  unlockedNeurons={unlockedNeurons}
                  onClose={handleCloseCompletionModal}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
