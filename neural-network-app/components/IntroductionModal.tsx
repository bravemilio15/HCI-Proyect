'use client';

import { useState, FormEvent } from 'react';
import { Neuron } from '@/domain/neuron.types';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface IntroductionModalProps {
  neuron: Neuron | null;
  onStart: () => void;
  onClose: () => void;
}

export default function IntroductionModal({
  neuron,
  onStart,
  onClose,
}: IntroductionModalProps) {
  const [view, setView] = useState<'introduction' | 'chat'>('introduction');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);

  if (!neuron) return null;

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAiResponding) return;

    const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: userInput }];
    setChatHistory(newHistory);
    setUserInput('');
    setIsAiResponding(true);

    try {
      const response = await fetch('/api/chat/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput, topic: neuron.label }),
      });

      const data = await response.json();

      if (data.success) {
        setChatHistory([...newHistory, { sender: 'ai', text: data.answer }]);
      } else {
        const errorMessage = data.error || 'No se pudo procesar la pregunta.';
        setChatHistory([...newHistory, { sender: 'ai', text: `Lo siento, hubo un problema: ${errorMessage}` }]);
      }
    } catch (error) {
      setChatHistory([...newHistory, { sender: 'ai', text: 'Hubo un error de conexión. Inténtalo de nuevo.' }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleViewChange = (newView: 'introduction' | 'chat') => {
    setView(newView);
    if (newView === 'chat' && chatHistory.length === 0) {
      setIsAiResponding(true);
      setTimeout(() => {
        setChatHistory([
          { sender: 'ai', text: `¡Hola! Soy Axon. Pregúntame lo que quieras sobre ${neuron.label}.` }
        ]);
        setIsAiResponding(false);
      }, 1000);
    }
  }

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col p-6 md:p-8 overflow-y-auto relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl font-bold z-10"
      >
        ×
      </button>

      {view === 'introduction' && (
        <div className="text-center flex flex-col justify-between items-center h-full py-4">
          <div className="mb-6 mt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {neuron.label}
            </h1>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-prose px-4">
              {neuron.description}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-md px-4 pb-4">
            <button
              onClick={onStart}
              className="w-full px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-lg font-bold rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-700/50"
            >
              Comenzar Quiz
            </button>
            <div className="text-center w-full">
              <button
                onClick={() => handleViewChange('chat')}
                className="w-full px-6 py-2.5 border-2 border-blue-500 text-blue-400 font-semibold text-base rounded-xl hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 transition-all duration-300 transform hover:scale-105 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Consultar a Axon (IA)
              </button>
              <p className="text-xs text-gray-400 mt-1.5">Si no sabes algo, preguntale a la IA antes de empezar</p>
            </div>
          </div>
        </div>
      )}

      {view === 'chat' && (
        <div className="flex flex-col h-full">
          <button onClick={() => handleViewChange('introduction')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 flex-shrink-0">
            &larr; Volver a la introducción
          </button>
          <div className="text-left flex-grow flex flex-col">
            <div className="flex-grow bg-gray-900/50 rounded-lg p-4 overflow-y-auto border border-gray-700 mb-4">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-3 py-1 rounded-lg ${msg.sender === 'user' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    {msg.text}
                  </span>
                </div>
              ))}
              {isAiResponding && (
                <div className="text-left">
                  <span className="inline-block px-3 py-1 rounded-lg bg-gray-700 text-gray-400 animate-pulse">
                    Axon está pensando...
                  </span>
                </div>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Pregúntale algo a Axon..."
                className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isAiResponding}
              />
              <button type="submit" className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isAiResponding || !userInput.trim()}>
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
