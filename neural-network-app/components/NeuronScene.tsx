'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Neuron } from '@/domain/neuron.types';
import Neuron3D from './Neuron3D';
import ConnectionLine from './ConnectionLine';
import { PHYSICS_CONSTANTS } from '@/shared/constants/network.constants';
import { RapierRigidBody } from '@react-three/rapier';

interface NeuronSceneProps {
  neurons: Neuron[];
  onNeuronClick: (neuronId: string) => void;
}

interface NeuronWithPosition extends Neuron {
  position3D: { x: number; y: number; z: number };
}

function normalize2DTo3D(x: number, y: number, oldMin: number, oldMax: number) {
  const newMin = -7;
  const newMax = 7;
  const normalizedX = ((x - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
  const normalizedY = ((y - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
  return { x: normalizedX, y: -normalizedY, z: 0 };
}

function generateRandomPosition(existingPositions: { x: number; y: number; z: number }[], minDistance: number = 2): { x: number; y: number; z: number } {
  const { minX, maxX, minY, maxY, z } = PHYSICS_CONSTANTS.SPAWN_AREA;
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    const position = { x, y, z };

    const isFarEnough = existingPositions.every(existingPos => {
      const dx = existingPos.x - x;
      const dy = existingPos.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance >= minDistance;
    });

    if (isFarEnough) {
      return position;
    }

    attempts++;
  }

  return { x: 0, y: 0, z };
}

export default function NeuronScene({ neurons, onNeuronClick }: NeuronSceneProps) {
  const neuronRefs = useRef<Map<string, React.RefObject<RapierRigidBody>>>(new Map());
  useEffect(() => {
    neurons.forEach(neuron => {
      if (!neuronRefs.current.has(neuron.id)) {
        neuronRefs.current.set(neuron.id, { current: null });
      }
    });
  }, [neurons]);

  const neuronPositions = useMemo(() => {
    const existingPositions: { x: number; y: number; z: number }[] = [];

    return neurons.map(neuron => {
      let pos3D: { x: number; y: number; z: number };

      if (neuron.position.x === 0 && neuron.position.y === 0) {
        pos3D = generateRandomPosition(existingPositions, 2.5);
      } else {
        pos3D = normalize2DTo3D(neuron.position.x, neuron.position.y, 0, 500);
      }

      existingPositions.push(pos3D);

      return {
        ...neuron,
        position3D: pos3D
      };
    });
  }, [neurons]);

  const connections = useMemo(() => {
    const connectionList: Array<{
      fromId: string;
      toId: string;
      active: boolean;
    }> = [];

    neurons.forEach(neuron => {
      if (neuron.status === 'dominated') {
        neuron.unlocks.forEach(unlockedId => {
          const targetNeuron = neurons.find(n => n.id === unlockedId);
          if (targetNeuron) {
            connectionList.push({
              fromId: neuron.id,
              toId: unlockedId,
              active: targetNeuron.status === 'available' || targetNeuron.status === 'in_progress' || targetNeuron.status === 'dominated'
            });
          }
        });
      }
    });

    return connectionList;
  }, [neurons]);

  return (
    <group>
      {neuronPositions.map(neuron => {
        let ref = neuronRefs.current.get(neuron.id);
        if (!ref) {
          ref = { current: null };
          neuronRefs.current.set(neuron.id, ref);
        }

        return (
          <Neuron3D
            key={neuron.id}
            neuron={neuron}
            position={[neuron.position3D.x, neuron.position3D.y, neuron.position3D.z]}
            onClick={() => onNeuronClick(neuron.id)}
            rigidBodyRef={ref}
          />
        );
      })}

      {connections.map((conn, index) => {
        const fromRef = neuronRefs.current.get(conn.fromId);
        const toRef = neuronRefs.current.get(conn.toId);

        if (!fromRef || !toRef) return null;

        return (
          <ConnectionLine
            key={`connection-${conn.fromId}-${conn.toId}`}
            fromBody={fromRef}
            toBody={toRef}
            active={conn.active}
          />
        );
      })}
    </group>
  );
}
