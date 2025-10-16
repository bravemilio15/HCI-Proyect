export const NEURON_CONSTANTS = {
  RADIUS: 40,
  PULSE_SPEED: 0.05,
  PROGRESS_INCREMENT: 25,
  HALO_SIZE: 60,
  CONNECTION_WEIGHT: 2,
  LABEL_OFFSET_Y: 60
};

export const COLORS = {
  BLOCKED: {
    fill: '#2a2a2a',
    stroke: '#444444'
  },
  AVAILABLE: {
    fill: '#1a4d7a',
    stroke: '#3a7dbf',
    pulse: '#5a9ddf'
  },
  IN_PROGRESS: {
    fill: '#4a5a2a',
    stroke: '#7a9a4a',
    progress: '#9abd5a'
  },
  DOMINATED: {
    fill: '#2a5a2a',
    stroke: '#4a9a4a',
    halo: '#6aba6a'
  },
  CONNECTION: {
    inactive: '#333333',
    active: '#6aba6a'
  },
  BACKGROUND: '#0a0a0a',
  TEXT: '#ffffff'
};

export const CANVAS_SIZE = {
  WIDTH: 1400,
  HEIGHT: 900
};
