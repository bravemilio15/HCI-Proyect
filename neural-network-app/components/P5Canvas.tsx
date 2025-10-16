'use client';

import { useEffect, useRef } from 'react';
import { Neuron } from '@/domain/neuron.types';
import { NEURON_CONSTANTS, COLORS, CANVAS_SIZE } from '@/shared/constants/network.constants';

interface P5CanvasProps {
  neurons: Neuron[];
  onNeuronClick: (neuronId: string) => void;
}

let globalP5Instance: any = null;

export default function P5Canvas({ neurons, onNeuronClick }: P5CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const neuronsRef = useRef<Neuron[]>(neurons);
  const onClickRef = useRef(onNeuronClick);
  const mountedRef = useRef(false);

  neuronsRef.current = neurons;
  onClickRef.current = onNeuronClick;

  useEffect(() => {
    if (!canvasRef.current || neurons.length === 0 || mountedRef.current || globalP5Instance) {
      return;
    }

    mountedRef.current = true;

    import('p5').then((p5Module) => {
      if (globalP5Instance) return;

      const P5 = p5Module.default;

      let pulseOffset = 0;
      let clickedNeuronId: string | null = null;
      let pulseAnimation = 0;

      const sketch = (p: any) => {
        p.setup = () => {
          const canvas = p.createCanvas(CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
          console.log('Canvas created successfully');
        };

        p.draw = () => {
          p.background(COLORS.BACKGROUND);
          pulseOffset += NEURON_CONSTANTS.PULSE_SPEED;

          const currentNeurons = neuronsRef.current;

          drawConnections(p, currentNeurons, pulseOffset);
          drawNeurons(p, currentNeurons, pulseOffset, clickedNeuronId, pulseAnimation);

          if (clickedNeuronId !== null) {
            pulseAnimation += 0.1;
            if (pulseAnimation > 1) {
              clickedNeuronId = null;
              pulseAnimation = 0;
            }
          }
        };

        p.mousePressed = () => {
          const currentNeurons = neuronsRef.current;

          for (const neuron of currentNeurons) {
            const distance = p.dist(p.mouseX, p.mouseY, neuron.position.x, neuron.position.y);

            if (distance < NEURON_CONSTANTS.RADIUS) {
              console.log(`Clicked on: ${neuron.label} (${neuron.status}) - Progress: ${neuron.progress}%`);

              if (neuron.status === 'available' || neuron.status === 'in_progress') {
                clickedNeuronId = neuron.id;
                pulseAnimation = 0;
                onClickRef.current(neuron.id);
              } else {
                console.log(`Cannot click - neuron is ${neuron.status}`);
              }
              break;
            }
          }
        };
      };

      globalP5Instance = new P5(sketch, canvasRef.current!);
    });

    return () => {
      if (globalP5Instance) {
        console.log('Cleaning up canvas');
        globalP5Instance.remove();
        globalP5Instance = null;
        mountedRef.current = false;
      }
    };
  }, []);

  return <div ref={canvasRef} className="border-2 border-gray-700 rounded-lg overflow-hidden"></div>;
}

function drawConnections(p: any, neurons: Neuron[], pulseOffset: number): void {
  neurons.forEach(neuron => {
    neuron.unlocks.forEach(targetId => {
      const targetNeuron = neurons.find(n => n.id === targetId);
      if (!targetNeuron) return;

      const isActive = neuron.status === 'dominated';
      const color = isActive ? COLORS.CONNECTION.active : COLORS.CONNECTION.inactive;
      const weight = isActive ? NEURON_CONSTANTS.CONNECTION_WEIGHT + 1 : NEURON_CONSTANTS.CONNECTION_WEIGHT;

      p.stroke(color);
      p.strokeWeight(weight);

      if (isActive) {
        const alpha = 150 + Math.sin(pulseOffset) * 50;
        p.stroke(p.red(color), p.green(color), p.blue(color), alpha);
      }

      p.line(
        neuron.position.x,
        neuron.position.y,
        targetNeuron.position.x,
        targetNeuron.position.y
      );
    });
  });
}

function drawNeurons(
  p: any,
  neurons: Neuron[],
  pulseOffset: number,
  clickedId: string | null,
  pulseAnim: number
): void {
  neurons.forEach(neuron => {
    const isClicked = neuron.id === clickedId;

    switch (neuron.status) {
      case 'blocked':
        drawBlockedNeuron(p, neuron);
        break;
      case 'available':
        drawAvailableNeuron(p, neuron, pulseOffset);
        break;
      case 'in_progress':
        drawInProgressNeuron(p, neuron);
        break;
      case 'dominated':
        drawDominatedNeuron(p, neuron, pulseOffset);
        break;
    }

    if (isClicked) {
      drawClickPulse(p, neuron, pulseAnim);
    }

    drawLabel(p, neuron);
  });
}

function drawBlockedNeuron(p: any, neuron: Neuron): void {
  p.fill(COLORS.BLOCKED.fill);
  p.stroke(COLORS.BLOCKED.stroke);
  p.strokeWeight(2);
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2);
}

function drawAvailableNeuron(p: any, neuron: Neuron, pulseOffset: number): void {
  const pulseAlpha = 150 + Math.sin(pulseOffset) * 105;

  p.fill(COLORS.AVAILABLE.fill);
  p.stroke(COLORS.AVAILABLE.stroke);
  p.strokeWeight(2);
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2);

  p.stroke(
    p.red(COLORS.AVAILABLE.pulse),
    p.green(COLORS.AVAILABLE.pulse),
    p.blue(COLORS.AVAILABLE.pulse),
    pulseAlpha
  );
  p.strokeWeight(3);
  p.noFill();
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2 + 5);
}

function drawInProgressNeuron(p: any, neuron: Neuron): void {
  const brightness = p.map(neuron.progress, 0, 100, 50, 255);

  p.fill(COLORS.IN_PROGRESS.fill);
  p.stroke(COLORS.IN_PROGRESS.stroke);
  p.strokeWeight(2);
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2);

  const progressAngle = p.map(neuron.progress, 0, 100, 0, p.TWO_PI);
  p.fill(
    p.red(COLORS.IN_PROGRESS.progress),
    p.green(COLORS.IN_PROGRESS.progress),
    p.blue(COLORS.IN_PROGRESS.progress),
    brightness
  );
  p.noStroke();
  p.arc(
    neuron.position.x,
    neuron.position.y,
    NEURON_CONSTANTS.RADIUS * 2,
    NEURON_CONSTANTS.RADIUS * 2,
    -p.HALF_PI,
    -p.HALF_PI + progressAngle,
    p.PIE
  );
}

function drawDominatedNeuron(p: any, neuron: Neuron, pulseOffset: number): void {
  const haloAlpha = 100 + Math.sin(pulseOffset * 0.7) * 50;

  p.noStroke();
  p.fill(
    p.red(COLORS.DOMINATED.halo),
    p.green(COLORS.DOMINATED.halo),
    p.blue(COLORS.DOMINATED.halo),
    haloAlpha
  );
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.HALO_SIZE * 2);

  p.fill(COLORS.DOMINATED.fill);
  p.stroke(COLORS.DOMINATED.stroke);
  p.strokeWeight(3);
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2);
}

function drawClickPulse(p: any, neuron: Neuron, animation: number): void {
  const pulseSize = NEURON_CONSTANTS.RADIUS * 2 + animation * 30;
  const pulseAlpha = 255 * (1 - animation);

  p.noFill();
  p.stroke(255, 255, 255, pulseAlpha);
  p.strokeWeight(3);
  p.circle(neuron.position.x, neuron.position.y, pulseSize);
}

function drawLabel(p: any, neuron: Neuron): void {
  p.fill(COLORS.TEXT);
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(12);
  p.text(neuron.label, neuron.position.x, neuron.position.y + NEURON_CONSTANTS.LABEL_OFFSET_Y);
}
