export const NEURON_CONSTANTS = {
  RADIUS: 40,
  PULSE_SPEED: 0.05,
  PROGRESS_INCREMENT: 10,
  HALO_SIZE: 60,
  CONNECTION_WEIGHT: 2,
  LABEL_OFFSET_Y: 60,
  SYNAPSE_PARTICLE_COUNT: 8,
  SYNAPSE_PARTICLE_SPEED: 2,
  ELECTRICAL_PULSE_COUNT: 3,
  GLOW_INTENSITY: 20,
  SPARK_COUNT: 5
};

export const COLORS = {
  BLOCKED: {
    fill: '#8a8a8a',
    stroke: '#9a9a9a',
    core: '#7a7a7a'
  },
  AVAILABLE: {
    fill: '#9a9a9a',
    stroke: '#aaaaaa',
    pulse: '#ffffff',
    glow: '#ffffff',
    spark: '#ffffff'
  },
  IN_PROGRESS: {
    fill: '#9a9a9a',
    stroke: '#aaaaaa',
    progress: '#bababa',
    electrical: '#ffffff',
    synapse: '#ffffff'
  },
  DOMINATED: {
    fill: '#c5c5c5',
    stroke: '#d5d5d5',
    halo: '#ffffff',
    glow: '#ffffff',
    particle: '#ffffff'
  },
  CONNECTION: {
    inactive: '#5a5a5a',
    active: '#ffffff',
    signal: '#ffffff'
  },
  BACKGROUND: '#0a0a0a',
  TEXT: '#ffffff',
  NEURON_CORE: '#ffffff',
  ELECTRICAL_PULSE: '#ffffff'
};

export const ANIMATION_CONSTANTS = {
  PULSE_FREQUENCY: 0.03,
  ELECTRICAL_SPEED: 0.1,
  SYNAPSE_FADE_SPEED: 0.05,
  GLOW_PULSE_SPEED: 0.02,
  SPARK_DURATION: 30,
  BIRTH_ANIMATION_DURATION: 60
};

export const CANVAS_SIZE = {
  WIDTH: 500,
  HEIGHT: 600
};
