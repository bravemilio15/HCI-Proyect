'use client';

import { useRef, useMemo, useEffect } from 'react';
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

interface Neuron3DProps {
  neuron: Neuron;
  position: [number, number, number];
  onClick: () => void;
}

export default function Neuron3D({ neuron, position, onClick }: Neuron3DProps) {
  const meshRef = useRef<Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const pulseRef = useRef(0);
  const flickerRef = useRef(0);

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
        return {
          mainColor: COLORS.IN_PROGRESS.main,
          emissiveColor: COLORS.IN_PROGRESS.emissive,
          emissiveIntensity: COLORS.IN_PROGRESS.pulseIntensity,
          showPulse: true,
          showFlicker: false
        };
      case 'dominated':
        return {
          mainColor: COLORS.DOMINATED.main,
          emissiveColor: COLORS.DOMINATED.emissive,
          emissiveIntensity: COLORS.DOMINATED.intensity,
          showPulse: false,
          showFlicker: true
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

    if (showPulse) {
      pulseRef.current += delta * ANIMATION_CONSTANTS.PULSE_FREQUENCY;
      const pulseWave = Math.sin(pulseRef.current);
      const pulseScale = 1 + pulseWave * 0.25;
      meshRef.current.scale.setScalar(pulseScale);

      const pulseMaterial = meshRef.current.material as any;
      if (pulseMaterial.emissiveIntensity !== undefined) {
        const intensityMultiplier = 0.3 + (pulseWave * 0.5 + 0.5) * 0.7;
        pulseMaterial.emissiveIntensity = emissiveIntensity * intensityMultiplier * 2;
      }
    } else if (showFlicker) {
      flickerRef.current += delta * ANIMATION_CONSTANTS.FLICKER_SPEED;
      const flickerValue = Math.sin(flickerRef.current) * 0.5 + 0.5;
      const flickerIntensity =
        ANIMATION_CONSTANTS.FLICKER_INTENSITY_MIN +
        (ANIMATION_CONSTANTS.FLICKER_INTENSITY_MAX - ANIMATION_CONSTANTS.FLICKER_INTENSITY_MIN) * flickerValue;

      const flickerMaterial = meshRef.current.material as any;
      if (flickerMaterial.emissiveIntensity !== undefined) {
        flickerMaterial.emissiveIntensity = flickerIntensity * 1.5;
      }
      meshRef.current.scale.setScalar(1);
    } else {
      meshRef.current.scale.setScalar(1);
      const material = meshRef.current.material as any;
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = emissiveIntensity;
      }
    }
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
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>

        {neuron.status === 'in_progress' && progressPercentage > 0 && progressPercentage < 1 && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[NEURON_CONSTANTS.RADIUS * 1.15, NEURON_CONSTANTS.RADIUS * 1.25, 32, 1, 0, Math.PI * 2 * progressPercentage]} />
            <meshBasicMaterial
              color={COLORS.IN_PROGRESS.progressColor}
              transparent
              opacity={0.9}
            />
          </mesh>
        )}
      </RigidBody>

      <Text
        position={[0, -NEURON_CONSTANTS.LABEL_OFFSET_Y, 0]}
        fontSize={0.3}
        color={COLORS.TEXT}
        anchorX="center"
        anchorY="middle"
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
        >
          {Math.round(neuron.progress)}%
        </Text>
      )}
    </group>
  );
}
