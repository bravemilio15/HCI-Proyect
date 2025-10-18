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

  const fetchNetwork = useCallback(async () => {
    try {
      console.log('[NETWORK-CANVAS] Fetching network state...');
      const response = await fetch('/api/network');
      const data = await response.json();

      if (data.success) {
        console.log('[NETWORK-CANVAS] Network state received:', data.data.neurons.map((n: Neuron) => ({
          id: n.id,
          status: n.status,
          progress: n.progress
        })));
        setNeurons(data.data.neurons);
        if (selectedNeuron) {
          const updated = data.data.neurons.find((n: Neuron) => n.id === selectedNeuron.id);
          if (updated) {
            console.log('[NETWORK-CANVAS] Selected neuron updated:', {
              id: updated.id,
              status: updated.status,
              progress: updated.progress
            });
            setSelectedNeuron(updated);
          }
        }
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
  }, [selectedNeuron]);

  useEffect(() => {
    fetchNetwork();
  }, []);

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

    setAnswerFeedback(null);
  }, [neurons]);

  const handleStartQuestions = useCallback(() => {
    setShowIntroModal(false);
    setShowQuestionPanel(true);
  }, []);

  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (!selectedNeuron || isAnswering) return;

    console.log('[NETWORK-CANVAS] Handling answer:', {
      neuronId: selectedNeuron.id,
      answerIndex
    });

    setIsAnswering(true);
    setAnswerFeedback(null);

    try {
      const response = await fetch('/api/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedNeuron.id,
          answerIndex
        }),
      });

      const data = await response.json();
      console.log('[NETWORK-CANVAS] Answer response:', data);

      if (data.success) {
        setAnswerFeedback(data.isCorrect);

        setFeedbackNeuronId(selectedNeuron.id);
        setFeedbackType(data.isCorrect ? 'correct' : 'incorrect');

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (data.isCorrect) {
          console.log('[NETWORK-CANVAS] Correct answer! Updating network...');
          await fetchNetwork();

          if (data.isCompleted) {
            console.log('[NETWORK-CANVAS] Neuron completed! Unlocked:', data.unlockedNeurons);
            setUnlockedNeurons(data.unlockedNeurons || []);
            setShowQuestionPanel(false);
            setShowCompletionModal(true);
          }
        } else {
          console.log('[NETWORK-CANVAS] Wrong answer - neuron stays at same question');
        }
      } else {
        console.error('Failed to submit answer:', data.error);
        setAnswerFeedback(false);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setAnswerFeedback(false);
    } finally {
      setIsAnswering(false);
    }
  }, [selectedNeuron, isAnswering, fetchNetwork]);

  const handleCloseIntroModal = useCallback(() => {
    setShowIntroModal(false);
    setSelectedNeuron(null);
  }, []);

  const handleCloseQuestionPanel = useCallback(() => {
    setShowQuestionPanel(false);
    setSelectedNeuron(null);
    setAnswerFeedback(null);
  }, []);

  const handleCloseCompletionModal = useCallback(() => {
    setShowCompletionModal(false);
    setSelectedNeuron(null);
    setUnlockedNeurons([]);
  }, []);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackNeuronId(null);
    setFeedbackType(null);
  }, []);

  const handleReset = useCallback(async () => {
    try {
      console.log('[NETWORK-CANVAS] Resetting network...');
      const response = await fetch('/api/network/reset', {
        method: 'POST',
      });

      const data = await response.json();
      console.log('[NETWORK-CANVAS] Reset response:', data);

      if (data.success) {
        setNeurons(data.data.neurons);
        setSelectedNeuron(null);
        setShowIntroModal(false);
        setShowQuestionPanel(false);
        setShowCompletionModal(false);
        setAnswerFeedback(null);
        setUnlockedNeurons([]);
        console.log('[NETWORK-CANVAS] Network reset successfully');
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

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-full flex items-center justify-center"
        animate={{
          width: showQuestionPanel ? `${UI_ANIMATION.CANVAS_SPLIT_PERCENTAGE}%` : '100%'
        }}
        transition={{
          duration: UI_ANIMATION.MODAL_TRANSITION_DURATION,
          ease: UI_ANIMATION.MODAL_TRANSITION_EASE
        }}
      >
        {!showQuestionPanel && (
          <div className="absolute top-8 left-0 right-0 flex flex-col items-center z-10">
            <h1 className="text-white text-5xl font-bold mb-4">Red Neuronal de Aprendizaje</h1>
            <p className="text-gray-400 mb-12 text-xl">
              Haz clic en la neurona para comenzar a aprender
            </p>
          </div>
        )}

        {neurons.length > 0 && (
          <ThreeCanvas
            neurons={neurons}
            onNeuronClick={handleNeuronClick}
            feedbackNeuronId={feedbackNeuronId}
            feedbackType={feedbackType}
            onFeedbackComplete={handleFeedbackComplete}
          />
        )}
      </motion.div>

      <AnimatePresence>
        {showQuestionPanel && selectedNeuron && (
          <motion.div
            className="absolute top-0 right-0 h-full flex items-center justify-center bg-black"
            style={{ width: `${UI_ANIMATION.CANVAS_SPLIT_PERCENTAGE}%` }}
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{
              duration: UI_ANIMATION.MODAL_TRANSITION_DURATION,
              ease: UI_ANIMATION.MODAL_TRANSITION_EASE
            }}
          >
            <QuestionModal
              neuron={selectedNeuron}
              onAnswer={handleAnswer}
              onClose={handleCloseQuestionPanel}
              isCorrect={answerFeedback}
              isAnswering={isAnswering}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showIntroModal && selectedNeuron && (
        <IntroductionModal
          neuron={selectedNeuron}
          onStart={handleStartQuestions}
          onClose={handleCloseIntroModal}
        />
      )}

      {showCompletionModal && selectedNeuron && (
        <CompletionModal
          neuron={selectedNeuron}
          unlockedNeurons={unlockedNeurons}
          onClose={handleCloseCompletionModal}
        />
      )}

      <ResetButton onReset={handleReset} />
    </div>
  );
}
