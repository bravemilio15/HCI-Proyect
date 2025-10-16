'use client';

import { useMemo } from 'react';
import { Neuron } from '@/domain/neuron.types';
import Neuron3D from './Neuron3D';
import ConnectionLine from './ConnectionLine';
import { PHYSICS_CONSTANTS } from '@/shared/constants/network.constants';

interface NeuronSceneProps {
  neurons: Neuron[];
  onNeuronClick: (neuronId: string) => void;
}

function normalize2DTo3D(x: number, y: number, oldMin: number, oldMax: number) {
  const newMin = -7;
  const newMax = 7;
  const normalizedX = ((x - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
  const normalizedY = ((y - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
  return { x: normalizedX, y: -normalizedY, z: 0 };
}

export default function NeuronScene({ neurons, onNeuronClick }: NeuronSceneProps) {
  const connections = useMemo(() => {
    const connectionList: Array<{
      from: { x: number; y: number; z: number };
      to: { x: number; y: number; z: number };
      active: boolean;
    }> = [];

    neurons.forEach(neuron => {
      if (neuron.status === 'dominated') {
        neuron.unlocks.forEach(unlockedId => {
          const targetNeuron = neurons.find(n => n.id === unlockedId);
          if (targetNeuron) {
            const fromPos = normalize2DTo3D(neuron.position.x, neuron.position.y, 0, 500);
            const toPos = normalize2DTo3D(targetNeuron.position.x, targetNeuron.position.y, 0, 500);

            connectionList.push({
              from: fromPos,
              to: toPos,
              active: targetNeuron.status === 'available' || targetNeuron.status === 'in_progress' || targetNeuron.status === 'dominated'
            });
          }
        });
      }
    });

    return connectionList;
  }, [neurons]);

  const neuronPositions = useMemo(() => {
    return neurons.map(neuron => {
      const pos3D = normalize2DTo3D(neuron.position.x, neuron.position.y, 0, 500);
      return {
        ...neuron,
        position3D: pos3D
      };
    });
  }, [neurons]);

  return (
    <group>
      {connections.map((conn, index) => (
        <ConnectionLine
          key={`connection-${index}`}
          from={conn.from}
          to={conn.to}
          active={conn.active}
        />
      ))}

      {neuronPositions.map(neuron => (
        <Neuron3D
          key={neuron.id}
          neuron={neuron}
          position={[neuron.position3D.x, neuron.position3D.y, neuron.position3D.z]}
          onClick={() => onNeuronClick(neuron.id)}
        />
      ))}
    </group>
  );
}
