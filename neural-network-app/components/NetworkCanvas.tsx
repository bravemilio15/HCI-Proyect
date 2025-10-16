'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Neuron } from '@/domain/neuron.types';
import IntroductionModal from './IntroductionModal';
import QuestionModal from './QuestionModal';
import CompletionModal from './CompletionModal';

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

        if (data.isCorrect) {
          console.log('[NETWORK-CANVAS] Correct answer! Updating network...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          await fetchNetwork();

          if (data.isCompleted) {
            console.log('[NETWORK-CANVAS] Neuron completed! Unlocked:', data.unlockedNeurons);
            setUnlockedNeurons(data.unlockedNeurons || []);
            setShowQuestionPanel(false);
            setShowCompletionModal(true);
          }
        } else {
          console.log('[NETWORK-CANVAS] Wrong answer');
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
    <div className="flex h-screen bg-black">
      {showQuestionPanel ? (
        <>
          <div className="w-1/2 flex items-center justify-center p-8">
            {neurons.length > 0 && (
              <ThreeCanvas neurons={neurons} onNeuronClick={handleNeuronClick} />
            )}
          </div>

          <div className="w-1/2 flex items-center justify-center">
            {selectedNeuron && (
              <QuestionModal
                neuron={selectedNeuron}
                onAnswer={handleAnswer}
                onClose={handleCloseQuestionPanel}
                isCorrect={answerFeedback}
                isAnswering={isAnswering}
              />
            )}
          </div>
        </>
      ) : (
        <div className="w-full flex flex-col items-center justify-center">
          <h1 className="text-white text-5xl font-bold mb-4">Red Neuronal de Aprendizaje</h1>
          <p className="text-gray-400 mb-12 text-xl">
            Haz clic en la neurona para comenzar a aprender
          </p>

          {neurons.length > 0 && (
            <ThreeCanvas neurons={neurons} onNeuronClick={handleNeuronClick} />
          )}
        </div>
      )}

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
    </div>
  );
}
