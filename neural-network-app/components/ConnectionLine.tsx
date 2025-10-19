'use client';

import { useRef, useState, useMemo } from 'react';
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
  const tubeRef = useRef<THREE.Mesh>(null);
  const [curve, setCurve] = useState<THREE.QuadraticBezierCurve3 | null>(null);
  const [signals, setSignals] = useState<ElectricalSignal[]>([]);
  const signalCounter = useRef(0);
  const lastSignalTime = useRef(0);

  useFrame((state, delta) => {
    const currentTime = state.clock.getElapsedTime();

    if (fromBody.current && toBody.current) {
      try {
        const fromPos = fromBody.current.translation();
        const toPos = toBody.current.translation();

        if (fromPos && toPos && typeof fromPos.x === 'number' && typeof toPos.x === 'number') {
          const start = new Vector3(fromPos.x, fromPos.y, fromPos.z);
          const end = new Vector3(toPos.x, toPos.y, toPos.z);

          // Calculate control point for the curve
          const midpoint = new Vector3().addVectors(start, end).multiplyScalar(0.5);
          const direction = new Vector3().subVectors(end, start);
          const length = direction.length();
          direction.normalize();
          
          // Get a perpendicular vector (simple 2D rotation)
          const perpendicular = new Vector3(-direction.y, direction.x, 0);
          
          // Offset the control point proportionally to the line's length
          const offset = length * 0.2;
          const controlPoint = new Vector3().addVectors(midpoint, perpendicular.multiplyScalar(offset));

          setCurve(new THREE.QuadraticBezierCurve3(start, controlPoint, end));
        }
      } catch (error) {
        console.warn('[CONNECTION-LINE] Error updating positions:', error);
      }
    }

    if (active) {
      if (currentTime - lastSignalTime.current > 1.2 && signals.length < 2) {
        setSignals((prev) => [
          ...prev,
          { id: signalCounter.current++, progress: 0 }
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

  const tubePoints = useMemo(() => curve ? curve.getPoints(20) : [], [curve]);

  return (
    <group>
      {curve && tubePoints.length > 0 && (
        <>
          <Line
            points={tubePoints}
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
            try {
              const position = curve.getPointAt(signal.progress);
              if (!position || typeof position.x !== 'number') return null;

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
            } catch (error) {
              console.warn('[CONNECTION-LINE] Error rendering signal:', error);
              return null;
            }
          })}
        </>
      )}
    </group>
  );
}
