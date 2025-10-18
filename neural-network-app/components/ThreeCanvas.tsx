'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense } from 'react';
import * as THREE from 'three';
import { Neuron } from '@/domain/neuron.types';
import { CANVAS_SIZE, CAMERA_CONSTANTS, COLORS, PHYSICS_CONSTANTS, POST_PROCESSING, ORBIT_CONTROLS } from '@/shared/constants/network.constants';
import NeuronScene from './NeuronScene';

interface ThreeCanvasProps {
  neurons: Neuron[];
  onNeuronClick: (neuronId: string) => void;
  feedbackNeuronId?: string | null;
  feedbackType?: 'correct' | 'incorrect' | null;
  onFeedbackComplete?: () => void;
}

export default function ThreeCanvas({ neurons, onNeuronClick, feedbackNeuronId, feedbackType, onFeedbackComplete }: ThreeCanvasProps) {
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
            <NeuronScene
              neurons={neurons}
              onNeuronClick={onNeuronClick}
              feedbackNeuronId={feedbackNeuronId}
              feedbackType={feedbackType}
              onFeedbackComplete={onFeedbackComplete}
            />
          </Physics>
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={POST_PROCESSING.BLOOM_INTENSITY}
            luminanceThreshold={POST_PROCESSING.BLOOM_LUMINANCE_THRESHOLD}
            luminanceSmoothing={POST_PROCESSING.BLOOM_LUMINANCE_SMOOTHING}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={ORBIT_CONTROLS.MIN_DISTANCE}
          maxDistance={ORBIT_CONTROLS.MAX_DISTANCE}
          maxPolarAngle={ORBIT_CONTROLS.MAX_POLAR_ANGLE}
          minPolarAngle={ORBIT_CONTROLS.MIN_POLAR_ANGLE}
        />
      </Canvas>
    </div>
  );
}
