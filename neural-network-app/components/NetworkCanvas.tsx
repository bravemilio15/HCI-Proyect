'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Neuron } from '@/domain/neuron.types';
import { createSketch, SketchProps } from '@/shared/utils/p5-sketch';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
});

export default function NetworkCanvas() {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetwork = useCallback(async () => {
    try {
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
  }, []);

  useEffect(() => {
    fetchNetwork();
  }, [fetchNetwork]);

  const handleNeuronClick = useCallback(async (neuronId: string) => {
    const targetNeuron = neurons.find(n => n.id === neuronId);
    if (!targetNeuron || (targetNeuron.status !== 'available' && targetNeuron.status !== 'in_progress')) {
      return;
    }

    setNeurons(prevNeurons => {
      const updatedNeurons = prevNeurons.map(n => {
        if (n.id === neuronId) {
          const newProgress = Math.min(n.progress + 25, 100);
          return {
            ...n,
            progress: newProgress,
            status: newProgress >= 100 ? 'dominated' as const : 'in_progress' as const
          };
        }
        return n;
      });
      return updatedNeurons;
    });

    try {
      const response = await fetch('/api/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: neuronId }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchNetwork();
      } else {
        console.error('Failed to update neuron:', data.error);
      }
    } catch (err) {
      console.error('Error updating neuron:', err);
    }
  }, [neurons, fetchNetwork]);

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

  const sketchProps: SketchProps = {
    neurons,
    onNeuronClick: handleNeuronClick,
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <h1 className="text-white text-3xl mb-4">Red Neuronal de Aprendizaje</h1>
      <p className="text-gray-400 mb-6">Haz clic en las neuronas disponibles para aprender</p>
      <div className="border-2 border-gray-700 rounded-lg overflow-hidden">
        <Sketch setup={(p5Instance, parentRef) => {
          const sketch = createSketch(sketchProps);
          sketch(p5Instance);
        }} />
      </div>
      <div className="mt-6 text-white">
        <h2 className="text-xl mb-2">Leyenda:</h2>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 rounded-full"></div>
            <span>Bloqueada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-700 rounded-full"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-700 rounded-full"></div>
            <span>En Progreso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-700 rounded-full"></div>
            <span>Dominada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
