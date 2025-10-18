'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import { Vector3, CatmullRomCurve3, TubeGeometry } from 'three';
import { COLORS, NEURON_CONSTANTS, ANIMATION_CONSTANTS } from '@/shared/constants/network.constants';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

interface ConnectionLineProps {
  fromBody: React.RefObject<RapierRigidBody>;
  toBody: React.RefObject<RapierRigidBody>;
  active: boolean;
}

interface ElectricalSignal {
  id: number;
  progress: number;
}

export default function ConnectionLine({ fromBody, toBody, active }: ConnectionLineProps) {
  const flowRef = useRef(0);
  const tubeRef = useRef<THREE.Mesh>(null);
  const [points, setPoints] = useState<Vector3[]>([
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0)
  ]);
  const [signals, setSignals] = useState<ElectricalSignal[]>([]);
  const signalCounter = useRef(0);
  const lastSignalTime = useRef(0);

  useFrame((state, delta) => {
    const currentTime = state.clock.getElapsedTime();

    if (fromBody.current && toBody.current) {
      const fromPos = fromBody.current.translation();
      const toPos = toBody.current.translation();

      setPoints([
        new Vector3(fromPos.x, fromPos.y, fromPos.z),
        new Vector3(toPos.x, toPos.y, toPos.z)
      ]);
    }

    if (active && tubeRef.current) {
      flowRef.current += delta * ANIMATION_CONSTANTS.CONNECTION_FLOW_SPEED;
      if (flowRef.current > 1) {
        flowRef.current = 0;
      }

      const material = tubeRef.current.material as THREE.MeshPhysicalMaterial;
      if (material.emissiveIntensity !== undefined) {
        const pulse = Math.sin(currentTime * 2) * 0.3 + 0.7;
        material.emissiveIntensity = pulse;
      }
    } else if (!active) {
      flowRef.current = 0;
    }

    if (active) {

      if (currentTime - lastSignalTime.current > 1.2 && signals.length < 2) {
        setSignals((prev) => [
          ...prev,
          {
            id: signalCounter.current++,
            progress: 0
          }
        ]);
        lastSignalTime.current = currentTime;
      }

      setSignals((prev) =>
        prev
          .map((signal) => ({
            ...signal,
            progress: signal.progress + delta * ANIMATION_CONSTANTS.CONNECTION_FLOW_SPEED * 1.5
          }))
          .filter((signal) => signal.progress <= 1.0)
      );
    } else {
      setSignals([]);
    }
  });

  const lineColor = active ? COLORS.CONNECTION.active : COLORS.CONNECTION.inactive;
  const opacity = active ? COLORS.CONNECTION.activeOpacity : COLORS.CONNECTION.inactiveOpacity;

  const curve = points.length === 2 ? new CatmullRomCurve3(points) : null;

  return (
    <group>
      {curve && (
        <>
          <Line
            points={points}
            color={lineColor}
            lineWidth={2}
            transparent
            opacity={opacity * 0.6}
            dashed={!active}
            dashScale={20}
            dashSize={0.1}
            gapSize={0.05}
          />

          {active && (
            <mesh ref={tubeRef}>
              <tubeGeometry args={[curve, 20, 0.02, 8, false]} />
              <meshPhysicalMaterial
                color={lineColor}
                emissive={lineColor}
                emissiveIntensity={0.5}
                transparent
                opacity={opacity * 0.8}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          )}

          {signals.map((signal) => {
            const position = curve.getPointAt(signal.progress);
            const glowIntensity = Math.sin(signal.progress * Math.PI);

            return (
              <group key={signal.id} position={position}>
                <Sphere args={[0.15, 8, 8]}>
                  <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={glowIntensity * 0.8}
                  />
                </Sphere>

                <pointLight
                  position={[0, 0, 0]}
                  intensity={glowIntensity * 1.5}
                  distance={1.2}
                  color="#00ffff"
                  decay={2}
                />
              </group>
            );
          })}
        </>
      )}
    </group>
  );
}
