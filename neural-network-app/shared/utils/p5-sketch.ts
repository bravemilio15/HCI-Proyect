import p5 from 'p5';
import { Neuron } from '@/domain/neuron.types';
import { NEURON_CONSTANTS, COLORS, CANVAS_SIZE, ANIMATION_CONSTANTS } from '@/shared/constants/network.constants';

export interface SketchProps {
  neurons: Neuron[];
  onNeuronClick: (neuronId: string) => void;
}

interface ElectricalPulse {
  angle: number;
  speed: number;
  intensity: number;
}

interface SynapseParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface NeuronAnimation {
  pulses: ElectricalPulse[];
  particles: SynapseParticle[];
  glowIntensity: number;
  birthAnimation: number;
}

export function createSketch(props: SketchProps) {
  return (p: p5) => {
    let pulseOffset = 0;
    let clickedNeuronId: string | null = null;
    let pulseAnimation = 0;
    const neuronAnimations = new Map<string, NeuronAnimation>();

    p.setup = () => {
      p.createCanvas(CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
      initializeAnimations();
    };

    function initializeAnimations(): void {
      props.neurons.forEach(neuron => {
        neuronAnimations.set(neuron.id, {
          pulses: createElectricalPulses(),
          particles: [],
          glowIntensity: 0,
          birthAnimation: neuron.status === 'available' ? ANIMATION_CONSTANTS.BIRTH_ANIMATION_DURATION : 0
        });
      });
    }

    function createElectricalPulses(): ElectricalPulse[] {
      const pulses: ElectricalPulse[] = [];
      for (let i = 0; i < NEURON_CONSTANTS.ELECTRICAL_PULSE_COUNT; i++) {
        pulses.push({
          angle: (p.TWO_PI / NEURON_CONSTANTS.ELECTRICAL_PULSE_COUNT) * i,
          speed: ANIMATION_CONSTANTS.ELECTRICAL_SPEED + Math.random() * 0.05,
          intensity: Math.random() * 0.5 + 0.5
        });
      }
      return pulses;
    }

    p.draw = () => {
      p.background(COLORS.BACKGROUND);

      pulseOffset += NEURON_CONSTANTS.PULSE_SPEED;

      updateAnimations();

      drawConnections(p, props.neurons, pulseOffset);

      drawNeurons(p, props.neurons, pulseOffset, clickedNeuronId, pulseAnimation);

      if (clickedNeuronId !== null) {
        pulseAnimation += 0.1;
        if (pulseAnimation > 1) {
          clickedNeuronId = null;
          pulseAnimation = 0;
        }
      }
    };

    function updateAnimations(): void {
      props.neurons.forEach(neuron => {
        const anim = neuronAnimations.get(neuron.id);
        if (!anim) return;

        anim.pulses.forEach(pulse => {
          pulse.angle += pulse.speed;
          if (pulse.angle > p.TWO_PI) pulse.angle -= p.TWO_PI;
        });

        if (neuron.status === 'in_progress') {
          if (Math.random() < 0.1) {
            const angle = Math.random() * p.TWO_PI;
            anim.particles.push({
              x: neuron.position.x + Math.cos(angle) * NEURON_CONSTANTS.RADIUS,
              y: neuron.position.y + Math.sin(angle) * NEURON_CONSTANTS.RADIUS,
              vx: Math.cos(angle) * NEURON_CONSTANTS.SYNAPSE_PARTICLE_SPEED,
              vy: Math.sin(angle) * NEURON_CONSTANTS.SYNAPSE_PARTICLE_SPEED,
              life: 0,
              maxLife: 30
            });
          }
        }

        anim.particles = anim.particles.filter(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life++;
          return particle.life < particle.maxLife;
        });

        anim.glowIntensity = Math.sin(pulseOffset * ANIMATION_CONSTANTS.GLOW_PULSE_SPEED) * 0.5 + 0.5;

        if (anim.birthAnimation > 0) {
          anim.birthAnimation--;
        }
      });
    }

    p.mousePressed = () => {
      for (const neuron of props.neurons) {
        const distance = p.dist(p.mouseX, p.mouseY, neuron.position.x, neuron.position.y);

        if (distance < NEURON_CONSTANTS.RADIUS) {
          if (neuron.status === 'available' || neuron.status === 'in_progress') {
            clickedNeuronId = neuron.id;
            pulseAnimation = 0;
            props.onNeuronClick(neuron.id);
          }
          break;
        }
      }
    };
  };
}

function drawConnections(p: p5, neurons: Neuron[], pulseOffset: number): void {
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

        const signalPos = (pulseOffset * 0.5) % 1;
        const signalX = p.lerp(neuron.position.x, targetNeuron.position.x, signalPos);
        const signalY = p.lerp(neuron.position.y, targetNeuron.position.y, signalPos);

        p.fill(COLORS.CONNECTION.signal);
        p.noStroke();
        p.circle(signalX, signalY, 6);
      }

      p.stroke(color);
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
  p: p5,
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
        drawInProgressNeuron(p, neuron, pulseOffset);
        break;
      case 'dominated':
        drawDominatedNeuron(p, neuron, pulseOffset);
        break;
    }

    if (isClicked) {
      drawClickPulse(p, neuron, pulseAnim);
    }
  });
}

function drawBlockedNeuron(p: p5, neuron: Neuron): void {
  p.fill(COLORS.BLOCKED.fill);
  p.stroke(COLORS.BLOCKED.stroke);
  p.strokeWeight(2);
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2);

  p.fill(COLORS.BLOCKED.core);
  p.noStroke();
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 0.5);
}

function drawAvailableNeuron(p: p5, neuron: Neuron, pulseOffset: number): void {
  const pulseSize = Math.sin(pulseOffset * ANIMATION_CONSTANTS.PULSE_FREQUENCY) * 10;
  const glowIntensity = Math.sin(pulseOffset * ANIMATION_CONSTANTS.GLOW_PULSE_SPEED) * 0.5 + 0.5;

  for (let i = 3; i > 0; i--) {
    const alpha = (100 * glowIntensity * i) / 3;
    p.noStroke();
    p.fill(
      p.red(COLORS.AVAILABLE.glow),
      p.green(COLORS.AVAILABLE.glow),
      p.blue(COLORS.AVAILABLE.glow),
      alpha
    );
    p.circle(
      neuron.position.x,
      neuron.position.y,
      NEURON_CONSTANTS.RADIUS * 2 + pulseSize + (i * NEURON_CONSTANTS.GLOW_INTENSITY)
    );
  }

  p.fill(COLORS.AVAILABLE.fill);
  p.stroke(COLORS.AVAILABLE.stroke);
  p.strokeWeight(2);
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2);

  for (let i = 0; i < NEURON_CONSTANTS.SPARK_COUNT; i++) {
    const sparkAngle = (p.TWO_PI / NEURON_CONSTANTS.SPARK_COUNT) * i + pulseOffset * 2;
    const sparkDist = NEURON_CONSTANTS.RADIUS + pulseSize;
    const sparkX = neuron.position.x + Math.cos(sparkAngle) * sparkDist;
    const sparkY = neuron.position.y + Math.sin(sparkAngle) * sparkDist;
    const sparkSize = 3 + glowIntensity * 2;

    p.fill(COLORS.AVAILABLE.spark);
    p.noStroke();
    p.circle(sparkX, sparkY, sparkSize);
  }

  p.fill(COLORS.NEURON_CORE);
  p.noStroke();
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 0.4);
}

function drawInProgressNeuron(p: p5, neuron: Neuron, pulseOffset: number): void {
  const synapseIntensity = Math.sin(pulseOffset * 0.1) * 0.5 + 0.5;

  p.fill(COLORS.IN_PROGRESS.fill);
  p.stroke(COLORS.IN_PROGRESS.stroke);
  p.strokeWeight(2);
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2);

  for (let i = 0; i < NEURON_CONSTANTS.ELECTRICAL_PULSE_COUNT; i++) {
    const angle = (pulseOffset * 0.1 + (i / NEURON_CONSTANTS.ELECTRICAL_PULSE_COUNT) * p.TWO_PI);
    const pulseX = neuron.position.x + Math.cos(angle) * NEURON_CONSTANTS.RADIUS;
    const pulseY = neuron.position.y + Math.sin(angle) * NEURON_CONSTANTS.RADIUS;

    p.stroke(COLORS.ELECTRICAL_PULSE);
    p.strokeWeight(2);
    p.line(neuron.position.x, neuron.position.y, pulseX, pulseY);

    p.fill(COLORS.IN_PROGRESS.electrical, 200);
    p.noStroke();
    p.circle(pulseX, pulseY, 6);
  }

  const progressAngle = p.map(neuron.progress, 0, 100, 0, p.TWO_PI);
  p.noStroke();

  for (let layer = 0; layer < 3; layer++) {
    const layerAlpha = 100 - (layer * 30);
    p.fill(
      p.red(COLORS.IN_PROGRESS.synapse),
      p.green(COLORS.IN_PROGRESS.synapse),
      p.blue(COLORS.IN_PROGRESS.synapse),
      layerAlpha * synapseIntensity
    );
    p.arc(
      neuron.position.x,
      neuron.position.y,
      NEURON_CONSTANTS.RADIUS * 2 + (layer * 5),
      NEURON_CONSTANTS.RADIUS * 2 + (layer * 5),
      -p.HALF_PI,
      -p.HALF_PI + progressAngle,
      p.PIE
    );
  }

  p.fill(COLORS.NEURON_CORE, 150 + synapseIntensity * 105);
  p.noStroke();
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 0.5);

  const percentText = Math.round(neuron.progress) + '%';
  p.fill(COLORS.TEXT);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(10);
  p.text(percentText, neuron.position.x, neuron.position.y);
}

function drawDominatedNeuron(p: p5, neuron: Neuron, pulseOffset: number): void {
  const haloAlpha = 100 + Math.sin(pulseOffset * 0.7) * 50;
  const glowIntensity = Math.sin(pulseOffset * ANIMATION_CONSTANTS.GLOW_PULSE_SPEED) * 0.5 + 0.5;

  for (let i = 4; i > 0; i--) {
    const alpha = (haloAlpha * i) / 4;
    p.noStroke();
    p.fill(
      p.red(COLORS.DOMINATED.glow),
      p.green(COLORS.DOMINATED.glow),
      p.blue(COLORS.DOMINATED.glow),
      alpha
    );
    p.circle(
      neuron.position.x,
      neuron.position.y,
      NEURON_CONSTANTS.HALO_SIZE * 2 + (i * 10)
    );
  }

  for (let i = 0; i < NEURON_CONSTANTS.SYNAPSE_PARTICLE_COUNT; i++) {
    const particleAngle = (p.TWO_PI / NEURON_CONSTANTS.SYNAPSE_PARTICLE_COUNT) * i + pulseOffset * 0.5;
    const particleDist = NEURON_CONSTANTS.HALO_SIZE + Math.sin(pulseOffset + i) * 10;
    const particleX = neuron.position.x + Math.cos(particleAngle) * particleDist;
    const particleY = neuron.position.y + Math.sin(particleAngle) * particleDist;
    const particleSize = 4 + glowIntensity * 3;

    p.fill(COLORS.DOMINATED.particle, 200);
    p.noStroke();
    p.circle(particleX, particleY, particleSize);

    const innerX = neuron.position.x + Math.cos(particleAngle) * (NEURON_CONSTANTS.RADIUS + 5);
    const innerY = neuron.position.y + Math.sin(particleAngle) * (NEURON_CONSTANTS.RADIUS + 5);
    p.stroke(COLORS.DOMINATED.particle, 100);
    p.strokeWeight(1);
    p.line(innerX, innerY, particleX, particleY);
  }

  p.fill(COLORS.DOMINATED.fill);
  p.stroke(COLORS.DOMINATED.stroke);
  p.strokeWeight(3);
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 2);

  p.fill(COLORS.NEURON_CORE, 255);
  p.noStroke();
  p.circle(neuron.position.x, neuron.position.y, NEURON_CONSTANTS.RADIUS * 0.6);

  const starSize = 4 + glowIntensity * 2;
  for (let i = 0; i < 4; i++) {
    const starAngle = (p.HALF_PI * i) + pulseOffset * 0.3;
    const starX = neuron.position.x + Math.cos(starAngle) * (NEURON_CONSTANTS.RADIUS * 0.3);
    const starY = neuron.position.y + Math.sin(starAngle) * (NEURON_CONSTANTS.RADIUS * 0.3);
    p.fill(COLORS.DOMINATED.glow);
    p.noStroke();
    p.circle(starX, starY, starSize);
  }
}

function drawClickPulse(p: p5, neuron: Neuron, animation: number): void {
  const pulseSize = NEURON_CONSTANTS.RADIUS * 2 + animation * 50;
  const pulseAlpha = 255 * (1 - animation);

  p.noFill();
  p.stroke(COLORS.ELECTRICAL_PULSE, pulseAlpha);
  p.strokeWeight(4);
  p.circle(neuron.position.x, neuron.position.y, pulseSize);

  p.stroke(COLORS.AVAILABLE.glow, pulseAlpha * 0.7);
  p.strokeWeight(2);
  p.circle(neuron.position.x, neuron.position.y, pulseSize + 10);
}
