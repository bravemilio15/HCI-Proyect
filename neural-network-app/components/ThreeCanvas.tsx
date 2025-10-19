'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useRef, useState } from 'react';
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

    // Only animate scene position on desktop (when viewport is wide enough)
    // On mobile, panel is fullscreen overlay, so scene doesn't need to move
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

    // The calculated target to shift the scene right, centering it in the 60% viewport.
    const targetX = (isPanelOpen && isDesktop) ? 2.8 : 0;
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
  const [webglError, setWebglError] = useState(false);

  // Manejador de errores de WebGL
  const handleWebGLError = (error: unknown) => {
    console.error('[WebGL Error]:', error);
    setWebglError(true);
  };

  // Si hay error de WebGL, mostrar mensaje de ayuda
  if (webglError) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: COLORS.BACKGROUND,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '600px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '2rem',
          borderRadius: '12px',
          border: '2px solid #ff6b6b',
          color: 'white'
        }}>
          <h2 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Error de WebGL</h2>
          <p style={{ marginBottom: '1rem' }}>No se pudo inicializar el contexto 3D (WebGL).</p>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Soluciones:</h3>
          <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Recarga la página (F5) - El Hot Reload puede crear múltiples contextos</li>
            <li>Cierra otras pestañas que usen 3D/WebGL</li>
            <li>Actualiza los drivers de tu tarjeta gráfica</li>
            <li>Prueba en otro navegador (Chrome, Firefox, Edge)</li>
            <li>Verifica que WebGL esté habilitado en: <code style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>about:config</code></li>
          </ol>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: '#4080ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: COLORS.BACKGROUND }}>
      <Canvas
        onCreated={(state) => {
          // Verificar que WebGL se creó correctamente
          try {
            if (!state.gl.getContext()) {
              handleWebGLError('Failed to create WebGL context');
            }
          } catch (error) {
            handleWebGLError(error);
          }
        }}
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
        fallback={
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            Cargando escena 3D...
          </div>
        }
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