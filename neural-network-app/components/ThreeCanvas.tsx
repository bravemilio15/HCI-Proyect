'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Neuron } from '@/domain/neuron.types';
import { CAMERA_CONSTANTS, COLORS, PHYSICS_CONSTANTS, POST_PROCESSING, ORBIT_CONTROLS } from '@/shared/constants/network.constants';
import NeuronScene from './NeuronScene';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface ThreeCanvasProps {
  neurons: Neuron[];
  onNeuronClick: (neuronId: string) => void;
  isPanelOpen: boolean;
  feedbackNeuronId?: string | null;
  feedbackType?: 'correct' | 'incorrect' | null;
  onFeedbackComplete?: () => void;
}

// Helper component to handle all scene animations
function SceneAnimator({ sceneGroup, controlsRef, isPanelOpen }: {
  sceneGroup: React.RefObject<THREE.Group | null>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  isPanelOpen: boolean
}) {
  useFrame(() => {
    if (!sceneGroup.current || !controlsRef.current) return;

    // The calculated target to shift the scene right, centering it in the 60% viewport.
    const targetX = isPanelOpen ? 2.8 : 0;
    const lerpFactor = 0.15; // A snappier factor to sync with the 0.5s panel animation

    // Animate both the scene and the camera target to the new position
    sceneGroup.current.position.x = THREE.MathUtils.lerp(sceneGroup.current.position.x, targetX, lerpFactor);
    controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, lerpFactor);

    controlsRef.current.update();
  });

  return null; // This component only contains logic
}

export default function ThreeCanvas({ neurons, onNeuronClick, isPanelOpen, feedbackNeuronId, feedbackType, onFeedbackComplete }: ThreeCanvasProps) {
  const sceneGroup = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <div style={{ width: '100%', height: '100%', background: COLORS.BACKGROUND }}>
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

        <group ref={sceneGroup}>
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
        </group>

        <EffectComposer>
          <Bloom
            intensity={POST_PROCESSING.BLOOM_INTENSITY}
            luminanceThreshold={POST_PROCESSING.BLOOM_LUMINANCE_THRESHOLD}
            luminanceSmoothing={POST_PROCESSING.BLOOM_LUMINANCE_SMOOTHING}
          />
        </EffectComposer>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={ORBIT_CONTROLS.MIN_DISTANCE}
          maxDistance={ORBIT_CONTROLS.MAX_DISTANCE}
          maxPolarAngle={ORBIT_CONTROLS.MAX_POLAR_ANGLE}
          minPolarAngle={ORBIT_CONTROLS.MIN_POLAR_ANGLE}
        />

        {/* This component will handle the animations */}
        <SceneAnimator sceneGroup={sceneGroup} controlsRef={controlsRef} isPanelOpen={isPanelOpen} />
      </Canvas>
    </div>
  );
}