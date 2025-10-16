export type NeuronStatus = 'blocked' | 'available' | 'in_progress' | 'dominated';

export interface Position {
  x: number;
  y: number;
}

export interface Neuron {
  id: string;
  label: string;
  position: Position;
  progress: number;
  status: NeuronStatus;
  unlocks: string[];
}

export interface NetworkState {
  neurons: Neuron[];
}

export interface UpdateNeuronRequest {
  id: string;
}

export interface UpdateNeuronResponse {
  success: boolean;
  neuron?: Neuron;
  unlockedNeurons?: string[];
  message?: string;
}
