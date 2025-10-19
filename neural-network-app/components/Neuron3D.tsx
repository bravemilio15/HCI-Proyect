'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';
import { Text, Sparkles, useCursor } from '@react-three/drei';
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

interface FeedbackParticle {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  life: number;
}

interface Neuron3DProps {
  neuron: Neuron;
  position: [number, number, number];
  onClick: () => void;
  rigidBodyRef?: React.RefObject<RapierRigidBody | null>;
  feedbackType?: 'correct' | 'incorrect' | null;
  onFeedbackComplete?: () => void;
}

export default function Neuron3D({ neuron, position, onClick, rigidBodyRef: externalRef, feedbackType, onFeedbackComplete }: Neuron3DProps) {
  const meshRef = useRef<Mesh>(null);
  const internalRef = useRef<RapierRigidBody>(null);
  const rigidBodyRef = externalRef || internalRef;
  const pulseRef = useRef(0);
  const flickerRef = useRef(0);

  const [lightPulses, setLightPulses] = useState<LightPulse[]>([]);
  const pulseCounterRef = useRef(0);
  const lastPulseTimeRef = useRef(0);

  const [feedbackParticles, setFeedbackParticles] = useState<FeedbackParticle[]>([]);
  const particleCounterRef = useRef(0);
  const feedbackStartTimeRef = useRef<number | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [birthScale, setBirthScale] = useState(1);

  const pulseGeometryRef = useRef<THREE.SphereGeometry | null>(null);
  const auraGeometryRef = useRef<THREE.SphereGeometry | null>(null);

  const isInteractive = neuron.status === 'available' || neuron.status === 'in_progress';
  useCursor(isHovered && isInteractive);

  useEffect(() => {
    console.log(`[NEURON-3D] ${neuron.id} status changed:`, {
      status: neuron.status,
      progress: neuron.progress,
      position
    });
  }, [neuron.status, neuron.progress, neuron.id]);

  useEffect(() => {
    if (feedbackType && !feedbackStartTimeRef.current) {
      feedbackStartTimeRef.current = performance.now();

      const newParticles: FeedbackParticle[] = [];
      const particleCount = feedbackType === 'correct' ? 50 : 30;
      const speed = feedbackType === 'correct' ? ANIMATION_CONSTANTS.FEEDBACK_PARTICLE_SPEED : ANIMATION_CONSTANTS.FEEDBACK_PARTICLE_SPEED * 0.7;

      for (let i = 0; i < particleCount; i++) {
        let vel: [number, number, number];
        if (feedbackType === 'correct') {
          // Expansive shockwave
          const theta = Math.random() * 2 * Math.PI;
          const phi = Math.acos(2 * Math.random() - 1);
          vel = [
            Math.sin(phi) * Math.cos(theta) * speed,
            Math.sin(phi) * Math.sin(theta) * speed,
            Math.cos(phi) * speed
          ];
        } else {
          // Erratic fizzle
          vel = [
            (Math.random() - 0.5) * speed * 2,
            (Math.random() - 0.5) * speed * 2,
            (Math.random() - 0.5) * speed * 2
          ];
        }

        newParticles.push({
          id: particleCounterRef.current++,
          position: [0, 0, 0],
          velocity: vel,
          life: 1.0
        });
      }
      setFeedbackParticles(newParticles);
    }
  }, [feedbackType]);

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

    if (neuron.status === 'available') {
      const scale = 1 + Math.sin(currentTime * ANIMATION_CONSTANTS.AVAILABLE_PULSE_SPEED) * ANIMATION_CONSTANTS.AVAILABLE_PULSE_AMOUNT;
      meshRef.current.scale.set(scale, scale, scale);
    } else {
      meshRef.current.scale.set(1, 1, 1);
    }

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

    if (feedbackType && feedbackStartTimeRef.current) {
      const elapsed = (performance.now() - feedbackStartTimeRef.current) / 1000;

      if (elapsed >= ANIMATION_CONSTANTS.FEEDBACK_FLASH_DURATION) {
        setFeedbackParticles([]);
        feedbackStartTimeRef.current = null;
        if (onFeedbackComplete) {
          onFeedbackComplete();
        }
      } else {
        setFeedbackParticles((prev) =>
          prev.map((particle) => ({
            ...particle,
            position: [
              particle.position[0] + particle.velocity[0] * delta,
              particle.position[1] + particle.velocity[1] * delta,
              particle.position[2] + particle.velocity[2] * delta
            ],
            life: 1 - (elapsed / ANIMATION_CONSTANTS.FEEDBACK_FLASH_DURATION)
          }))
        );
      }
    }
  });

  const isClickable = neuron.status === 'available' || neuron.status === 'in_progress';

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
          onPointerOver={isClickable ? (e) => {
            e.stopPropagation();
            setIsHovered(true);
          } : undefined}
          onPointerOut={isClickable ? () => {
            setIsHovered(false);
          } : undefined}
          scale={[
            birthScale * (isHovered && isClickable ? 1.2 : 1),
            birthScale * (isHovered && isClickable ? 1.2 : 1),
            birthScale * (isHovered && isClickable ? 1.2 : 1)
          ]}
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
            toneMapped={false}
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
        <>
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

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry
              args={[
                ANIMATION_CONSTANTS.PROGRESS_RING_INNER_RADIUS,
                ANIMATION_CONSTANTS.PROGRESS_RING_OUTER_RADIUS,
                ANIMATION_CONSTANTS.PROGRESS_RING_SEGMENTS,
                1,
                0,
                (neuron.progress / 100) * Math.PI * 2
              ]}
            />
            <meshBasicMaterial
              color="#00FF88"
              side={THREE.DoubleSide}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      {neuron.status === 'dominated' && (
        <Sparkles
          count={ANIMATION_CONSTANTS.SPARKLES_COUNT}
          scale={ANIMATION_CONSTANTS.SPARKLES_SCALE}
          size={ANIMATION_CONSTANTS.SPARKLES_SIZE}
          speed={ANIMATION_CONSTANTS.SPARKLES_SPEED}
          color="#FFFFFF"
        />
      )}

      {feedbackParticles.map((particle) => {
        const color = feedbackType === 'correct' ? '#88ddff' : COLORS.FEEDBACK.incorrectEmissive;
        const scale = particle.life * (feedbackType === 'correct' ? 0.4 : 0.25);

        return (
          <mesh key={particle.id} position={particle.position} scale={[scale, scale, scale]}>
            <circleGeometry args={[0.5, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={particle.life}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}
