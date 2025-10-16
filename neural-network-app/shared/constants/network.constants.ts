export const NEURON_CONSTANTS = {
  RADIUS: 0.5,
  PULSE_MIN_SCALE: 0.8,
  PULSE_MAX_SCALE: 1.3,
  PULSE_SPEED: 2.0,
  PROGRESS_INCREMENT: 10,
  HALO_SIZE: 0.8,
  CONNECTION_WEIGHT: 0.02,
  LABEL_OFFSET_Y: 1.2,
  SYNAPSE_PARTICLE_COUNT: 8,
  SYNAPSE_PARTICLE_SPEED: 0.02,
  ELECTRICAL_PULSE_COUNT: 3,
  GLOW_INTENSITY: 1.5,
  SPARK_COUNT: 5,
  PHYSICS_MASS: 1.0,
  PHYSICS_RESTITUTION: 0.3,
  COLLISION_RADIUS: 0.6
};

export const COLORS = {
  BLOCKED: {
    main: '#4a4a4a',
    emissive: '#000000',
    intensity: 0
  },
  AVAILABLE: {
    main: '#8a8a8a',
    emissive: '#ffffff',
    pulseIntensity: 1.0,
    glowColor: '#ffffff'
  },
  IN_PROGRESS: {
    main: '#9a9a9a',
    emissive: '#ffffff',
    pulseIntensity: 0.8,
    progressColor: '#ffffff'
  },
  DOMINATED: {
    main: '#ffffff',
    emissive: '#ffffff',
    intensity: 2.5,
    glowColor: '#ffffff',
    flicker: true
  },
  CONNECTION: {
    inactive: '#3a3a3a',
    active: '#ffffff',
    signal: '#ffffff',
    activeOpacity: 0.8,
    inactiveOpacity: 0.3
  },
  BACKGROUND: '#0a0a0a',
  TEXT: '#ffffff'
};

export const ANIMATION_CONSTANTS = {
  PULSE_FREQUENCY: 1.5,
  PULSE_GROWTH_RATE: 0.05,
  ELECTRICAL_SPEED: 0.1,
  SYNAPSE_FADE_SPEED: 0.05,
  GLOW_PULSE_SPEED: 2.0,
  SPARK_DURATION: 30,
  BIRTH_ANIMATION_DURATION: 1.0,
  FLICKER_SPEED: 4.0,
  FLICKER_INTENSITY_MIN: 0.6,
  FLICKER_INTENSITY_MAX: 1.2,
  CONNECTION_FLOW_SPEED: 0.5
};

export const CANVAS_SIZE = {
  WIDTH: 800,
  HEIGHT: 600
};

export const CAMERA_CONSTANTS = {
  FOV: 50,
  NEAR: 0.1,
  FAR: 1000,
  POSITION_Z: 15,
  ORTHOGRAPHIC_FRUSTUM: 10
};

export const PHYSICS_CONSTANTS = {
  GRAVITY: [0, 0, 0] as [number, number, number],
  WORLD_BOUNDS: {
    minX: -8,
    maxX: 8,
    minY: -6,
    maxY: 6,
    minZ: -2,
    maxZ: 2
  },
  SPAWN_AREA: {
    minX: -7,
    maxX: 7,
    minY: -5,
    maxY: 5,
    z: 0
  }
};
