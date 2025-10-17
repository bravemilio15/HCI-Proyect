'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import * as THREE from 'three';
import { Neuron } from '@/domain/neuron.types';
import { CANVAS_SIZE, CAMERA_CONSTANTS, COLORS, PHYSICS_CONSTANTS } from '@/shared/constants/network.constants';
import NeuronScene from './NeuronScene';

interface ThreeCanvasProps {
  neurons: Neuron[];
  onNeuronClick: (neuronId: string) => void;
}

export default function ThreeCanvas({ neurons, onNeuronClick }: ThreeCanvasProps) {
  return (
    <div
      style={{
        width: CANVAS_SIZE.WIDTH,
        height: CANVAS_SIZE.HEIGHT,
        background: COLORS.BACKGROUND
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, CAMERA_CONSTANTS.POSITION_Z],
          fov: CAMERA_CONSTANTS.FOV,
          near: CAMERA_CONSTANTS.NEAR,
          far: CAMERA_CONSTANTS.FAR
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[COLORS.BACKGROUND]} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <pointLight position={[-10, -10, 10]} intensity={0.3} color="#4080ff" distance={25} decay={2} />

        <Suspense fallback={null}>
          <Physics
            gravity={PHYSICS_CONSTANTS.GRAVITY}
            timeStep="vary"
          >
            <NeuronScene neurons={neurons} onNeuronClick={onNeuronClick} />
          </Physics>
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
