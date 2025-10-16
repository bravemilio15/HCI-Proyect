'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import { COLORS, NEURON_CONSTANTS, ANIMATION_CONSTANTS } from '@/shared/constants/network.constants';

interface ConnectionLineProps {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  active: boolean;
}

export default function ConnectionLine({ from, to, active }: ConnectionLineProps) {
  const flowRef = useRef(0);

  const points = useMemo(() => {
    return [
      new Vector3(from.x, from.y, from.z),
      new Vector3(to.x, to.y, to.z)
    ];
  }, [from, to]);

  useFrame((state, delta) => {
    if (active) {
      flowRef.current += delta * ANIMATION_CONSTANTS.CONNECTION_FLOW_SPEED;
      if (flowRef.current > 1) {
        flowRef.current = 0;
      }
    }
  });

  const lineColor = active ? COLORS.CONNECTION.active : COLORS.CONNECTION.inactive;
  const opacity = active ? COLORS.CONNECTION.activeOpacity : COLORS.CONNECTION.inactiveOpacity;

  return (
    <group>
      <Line
        points={points}
        color={lineColor}
        lineWidth={NEURON_CONSTANTS.CONNECTION_WEIGHT}
        transparent
        opacity={opacity}
      />

      {active && (
        <mesh position={[
          from.x + (to.x - from.x) * flowRef.current,
          from.y + (to.y - from.y) * flowRef.current,
          from.z + (to.z - from.z) * flowRef.current
        ]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial
            color={COLORS.CONNECTION.signal}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
}
