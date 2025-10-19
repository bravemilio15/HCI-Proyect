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
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true);

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
    // This effect saves the state to localStorage whenever neurons change.
    if (neurons.length > 0 && !loading) {
      console.log('[NETWORK-CANVAS] Saving network state to localStorage.');
      localStorage.setItem('networkState', JSON.stringify(neurons));
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
    setIsPanelCollapsed(false); // Open panel when a neuron is clicked

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
          answerIndex, 
          currentState: neurons 
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
  const isPanelOpen = isPanelActive && !isPanelCollapsed;

  return (
    <div className="flex w-full h-screen bg-black overflow-hidden">
      {/* Canvas Container */}
      <motion.div 
        className="h-full relative"
        animate={{ width: isPanelOpen ? '60%' : '100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="absolute top-8 left-0 right-0 flex flex-col items-center z-10 pointer-events-none">
          <h1 className="text-white text-5xl font-bold mb-4">Red Neuronal de Aprendizaje</h1>
          <p className="text-gray-400 mb-12 text-xl">
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
      </motion.div>

      {/* Panel Container */}
      <motion.div 
        className="h-full bg-gray-900 relative overflow-hidden"
        animate={{ width: isPanelOpen ? '40%' : '0%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Panel Toggle Button */}
        {isPanelActive && (
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="absolute top-1/2 -left-4 -translate-y-1/2 bg-gray-800/80 text-white hover:bg-gray-700 transition-colors z-20 p-2 rounded-full"
            title={isPanelCollapsed ? 'Abrir panel' : 'Cerrar panel'}
          >
            {isPanelCollapsed ? '<' : '>'}
          </button>
        )}

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
    </div>
  );
}
