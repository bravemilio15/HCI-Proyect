export type NeuronStatus = 'blocked' | 'available' | 'in_progress' | 'dominated';

export interface Position {
  x: number;
  y: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Neuron {
  id: string;
  label: string;
  description: string;
  position: Position;
  progress: number;
  status: NeuronStatus;
  unlocks: string[];
  questions: Question[];
  currentQuestionIndex: number;
}

export interface NetworkState {
  neurons: Neuron[];
}

export interface UpdateNeuronRequest {
  id: string;
  answerIndex?: number;
}

export interface UpdateNeuronResponse {
  success: boolean;
  neuron?: Neuron;
  unlockedNeurons?: string[];
  message?: string;
  isCorrect?: boolean;
  isCompleted?: boolean;
}
