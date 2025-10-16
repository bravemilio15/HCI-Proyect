import { Neuron } from '@/domain/neuron.types';

export const INITIAL_NETWORK: Neuron[] = [
  {
    id: 'variables',
    label: 'Variables',
    position: { x: 150, y: 150 },
    progress: 0,
    status: 'available',
    unlocks: ['tipos-datos']
  },
  {
    id: 'tipos-datos',
    label: 'Tipos de Datos',
    position: { x: 350, y: 150 },
    progress: 0,
    status: 'blocked',
    unlocks: ['operadores']
  },
  {
    id: 'operadores',
    label: 'Operadores',
    position: { x: 550, y: 150 },
    progress: 0,
    status: 'blocked',
    unlocks: ['expresiones']
  },
  {
    id: 'expresiones',
    label: 'Expresiones',
    position: { x: 750, y: 150 },
    progress: 0,
    status: 'blocked',
    unlocks: ['funciones']
  },
  {
    id: 'condicionales',
    label: 'Condicionales',
    position: { x: 150, y: 350 },
    progress: 0,
    status: 'available',
    unlocks: ['bucles']
  },
  {
    id: 'bucles',
    label: 'Bucles',
    position: { x: 350, y: 350 },
    progress: 0,
    status: 'blocked',
    unlocks: ['arrays']
  },
  {
    id: 'arrays',
    label: 'Arrays',
    position: { x: 550, y: 350 },
    progress: 0,
    status: 'blocked',
    unlocks: ['metodos-arrays']
  },
  {
    id: 'metodos-arrays',
    label: 'Metodos de Arrays',
    position: { x: 750, y: 350 },
    progress: 0,
    status: 'blocked',
    unlocks: ['objetos']
  },
  {
    id: 'funciones',
    label: 'Funciones',
    position: { x: 450, y: 550 },
    progress: 0,
    status: 'blocked',
    unlocks: ['parametros']
  },
  {
    id: 'parametros',
    label: 'Parametros',
    position: { x: 650, y: 550 },
    progress: 0,
    status: 'blocked',
    unlocks: ['return', 'scope']
  },
  {
    id: 'return',
    label: 'Return',
    position: { x: 550, y: 700 },
    progress: 0,
    status: 'blocked',
    unlocks: []
  },
  {
    id: 'scope',
    label: 'Scope',
    position: { x: 750, y: 700 },
    progress: 0,
    status: 'blocked',
    unlocks: []
  },
  {
    id: 'objetos',
    label: 'Objetos',
    position: { x: 950, y: 350 },
    progress: 0,
    status: 'blocked',
    unlocks: ['propiedades', 'metodos-objetos']
  },
  {
    id: 'propiedades',
    label: 'Propiedades',
    position: { x: 950, y: 550 },
    progress: 0,
    status: 'blocked',
    unlocks: []
  },
  {
    id: 'metodos-objetos',
    label: 'Metodos de Objetos',
    position: { x: 1150, y: 550 },
    progress: 0,
    status: 'blocked',
    unlocks: []
  }
];

let networkState: Neuron[] = JSON.parse(JSON.stringify(INITIAL_NETWORK));

export function getNetworkState(): Neuron[] {
  return JSON.parse(JSON.stringify(networkState));
}

export function updateNeuronProgress(neuronId: string): {
  updatedNeuron: Neuron | null;
  unlockedNeurons: Neuron[]
} {
  const neuron = networkState.find(n => n.id === neuronId);

  if (!neuron || (neuron.status !== 'available' && neuron.status !== 'in_progress')) {
    return { updatedNeuron: null, unlockedNeurons: [] };
  }

  const PROGRESS_INCREMENT = 25;
  neuron.progress = Math.min(neuron.progress + PROGRESS_INCREMENT, 100);

  if (neuron.progress > 0 && neuron.progress < 100) {
    neuron.status = 'in_progress';
  } else if (neuron.progress >= 100) {
    neuron.status = 'dominated';
  }

  const unlockedNeurons: Neuron[] = [];

  if (neuron.status === 'dominated') {
    neuron.unlocks.forEach(unlockedId => {
      const targetNeuron = networkState.find(n => n.id === unlockedId);
      if (targetNeuron && targetNeuron.status === 'blocked') {
        const allPrerequisitesDominated = networkState
          .filter(n => n.unlocks.includes(unlockedId))
          .every(prereq => prereq.status === 'dominated');

        if (allPrerequisitesDominated) {
          targetNeuron.status = 'available';
          unlockedNeurons.push(targetNeuron);
        }
      }
    });
  }

  return {
    updatedNeuron: JSON.parse(JSON.stringify(neuron)),
    unlockedNeurons: JSON.parse(JSON.stringify(unlockedNeurons))
  };
}

export function resetNetwork(): void {
  networkState = JSON.parse(JSON.stringify(INITIAL_NETWORK));
}
