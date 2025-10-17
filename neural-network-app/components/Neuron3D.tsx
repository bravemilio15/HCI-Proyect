'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { Text } from '@react-three/drei';
import { Neuron } from '@/domain/neuron.types';
import {
  NEURON_CONSTANTS,
  COLORS,
  ANIMATION_CONSTANTS
} from '@/shared/constants/network.constants';

interface LightPulse {
  id: number;
  scale: number;
  opacity: number;
}

interface Neuron3DProps {
  neuron: Neuron;
  position: [number, number, number];
  onClick: () => void;
  rigidBodyRef?: React.RefObject<RapierRigidBody>;
}

export default function Neuron3D({ neuron, position, onClick, rigidBodyRef: externalRef }: Neuron3DProps) {
  const meshRef = useRef<Mesh>(null);
  const internalRef = useRef<RapierRigidBody>(null);
  const rigidBodyRef = externalRef || internalRef;
  const pulseRef = useRef(0);
  const flickerRef = useRef(0);

  const [lightPulses, setLightPulses] = useState<LightPulse[]>([]);
  const pulseCounterRef = useRef(0);
  const lastPulseTimeRef = useRef(0);

  const pulseGeometryRef = useRef<THREE.SphereGeometry | null>(null);
  const auraGeometryRef = useRef<THREE.SphereGeometry | null>(null);

  useEffect(() => {
    console.log(`[NEURON-3D] ${neuron.id} status changed:`, {
      status: neuron.status,
      progress: neuron.progress,
      position
    });
  }, [neuron.status, neuron.progress, neuron.id]);

  const { mainColor, emissiveColor, emissiveIntensity, showPulse, showFlicker } = useMemo(() => {
    console.log(`[NEURON-3D] ${neuron.id} computing colors:`, {
      status: neuron.status,
      progress: neuron.progress
    });

    const progressRatio = neuron.progress / 100;

    switch (neuron.status) {
      case 'blocked':
        return {
          mainColor: COLORS.BLOCKED.main,
          emissiveColor: COLORS.BLOCKED.emissive,
          emissiveIntensity: COLORS.BLOCKED.intensity,
          showPulse: false,
          showFlicker: false
        };
      case 'available':
        return {
          mainColor: COLORS.AVAILABLE.main,
          emissiveColor: COLORS.AVAILABLE.emissive,
          emissiveIntensity: COLORS.AVAILABLE.pulseIntensity,
          showPulse: true,
          showFlicker: false
        };
      case 'in_progress':
        const baseIntensity = COLORS.IN_PROGRESS.pulseIntensity;
        const progressBoost = progressRatio * 6.0;
        const totalIntensity = baseIntensity + progressBoost;

        const progressColor = `rgb(${Math.floor(80 + progressRatio * 175)}, ${Math.floor(80 + progressRatio * 175)}, ${Math.floor(80 + progressRatio * 175)})`;

        return {
          mainColor: progressColor,
          emissiveColor: COLORS.IN_PROGRESS.emissive,
          emissiveIntensity: totalIntensity,
          showPulse: true,
          showFlicker: false
        };
      case 'dominated':
        return {
          mainColor: COLORS.DOMINATED.main,
          emissiveColor: COLORS.DOMINATED.emissive,
          emissiveIntensity: 6.8,
          showPulse: true,
          showFlicker: false
        };
      default:
        return {
          mainColor: COLORS.BLOCKED.main,
          emissiveColor: COLORS.BLOCKED.emissive,
          emissiveIntensity: 0,
          showPulse: false,
          showFlicker: false
        };
    }
  }, [neuron.status, neuron.progress, neuron.id]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const currentTime = state.clock.getElapsedTime();

    if (showPulse) {
      pulseRef.current += delta * ANIMATION_CONSTANTS.PULSE_FREQUENCY;
      const pulseWave = Math.sin(pulseRef.current);

      const pulseMaterial = meshRef.current.material as any;
      if (pulseMaterial.emissiveIntensity !== undefined) {
        const intensityMultiplier = 0.3 + (pulseWave * 0.5 + 0.5) * 0.7;
        pulseMaterial.emissiveIntensity = emissiveIntensity * intensityMultiplier * 2;
      }

      const progressRatio = neuron.progress / 100;
      const pulseInterval = neuron.status === 'in_progress'
        ? Math.max(0.15, 0.8 - progressRatio * 0.65)
        : neuron.status === 'dominated'
        ? 0.4
        : 1.5;

      const maxPulses = neuron.status === 'dominated' ? 4 : 3;
      if (currentTime - lastPulseTimeRef.current > pulseInterval && lightPulses.length < maxPulses) {
        setLightPulses((prev) => [
          ...prev,
          {
            id: pulseCounterRef.current++,
            scale: 0.1,
            opacity: 1.0
          }
        ]);
        lastPulseTimeRef.current = currentTime;
      }
    } else {
      const material = meshRef.current.material as any;
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = emissiveIntensity;
      }
    }

    setLightPulses((prev) =>
      prev
        .map((pulse) => ({
          ...pulse,
          scale: pulse.scale + delta * ANIMATION_CONSTANTS.PULSE_GROWTH_RATE * 3,
          opacity: pulse.opacity - delta * ANIMATION_CONSTANTS.SYNAPSE_FADE_SPEED * 3
        }))
        .filter((pulse) => pulse.opacity > 0 && pulse.scale < 3.0)
    );
  });

  const isClickable = neuron.status === 'available' || neuron.status === 'in_progress';
  const progressPercentage = neuron.progress / 100;

  return (
    <group position={position}>
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        colliders="ball"
        mass={NEURON_CONSTANTS.PHYSICS_MASS}
        restitution={NEURON_CONSTANTS.PHYSICS_RESTITUTION}
        linearDamping={2}
        angularDamping={2}
        enabledRotations={[false, false, false]}
      >
        <mesh
          ref={meshRef}
          onClick={isClickable ? onClick : undefined}
          onPointerOver={isClickable ? (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; } : undefined}
          onPointerOut={isClickable ? () => { document.body.style.cursor = 'default'; } : undefined}
        >
          <sphereGeometry args={[NEURON_CONSTANTS.RADIUS, 32, 32]} />
          <meshStandardMaterial
            color={mainColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            metalness={0.2}
            roughness={0.3}
            transparent={false}
            opacity={1.0}
          />
        </mesh>

        {showPulse && (
          <mesh>
            <sphereGeometry args={[NEURON_CONSTANTS.RADIUS * 1.25, 16, 16]} />
            <meshBasicMaterial
              color={emissiveColor}
              transparent
              opacity={Math.min(emissiveIntensity * 0.35, 0.8)}
              depthWrite={false}
            />
          </mesh>
        )}

        {lightPulses.slice(0, neuron.status === 'dominated' ? 3 : 2).map((pulse) => {
          const progressRatio = neuron.progress / 100;
          const isDominated = neuron.status === 'dominated';
          const pulseOpacity = pulse.opacity * (0.4 + progressRatio * 0.5);

          return (
            <mesh key={pulse.id}>
              <sphereGeometry args={[NEURON_CONSTANTS.RADIUS * pulse.scale * (1 + progressRatio * 0.8), 16, 16]} />
              <meshBasicMaterial
                color={isDominated ? '#ffffff' : emissiveColor}
                transparent
                opacity={Math.min(pulseOpacity, 0.9)}
                depthWrite={false}
              />
            </mesh>
          );
        })}

        {(showPulse && emissiveIntensity > 0.5) && (
          <pointLight
            position={[0, 0, 0]}
            intensity={emissiveIntensity * NEURON_CONSTANTS.GLOW_INTENSITY * 2.5}
            distance={3 + (neuron.progress / 100) * 4}
            color={neuron.status === 'dominated' ? '#ffffff' : emissiveColor}
            decay={2}
          />
        )}
      </RigidBody>

      <Text
        position={[0, -NEURON_CONSTANTS.LABEL_OFFSET_Y, 0]}
        fontSize={0.3}
        color={COLORS.TEXT}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {neuron.label}
      </Text>

      {neuron.status === 'in_progress' && (
        <Text
          position={[0, -NEURON_CONSTANTS.LABEL_OFFSET_Y - 0.35, 0]}
          fontSize={0.2}
          color={COLORS.IN_PROGRESS.progressColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {Math.round(neuron.progress)}%
        </Text>
      )}
    </group>
  );
}
