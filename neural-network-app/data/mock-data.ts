import { Neuron, Question } from '@/domain/neuron.types';

const VARIABLES_QUESTIONS: Question[] = [
  {
    id: 'var-q1',
    question: 'Cual es la forma correcta de declarar una variable en JavaScript moderno?',
    options: ['let nombre = "Juan"'],
    correctAnswer: 0,
    explanation: 'let es la forma moderna y recomendada para declarar variables con scope de bloque'
  },
  {
    id: 'var-q2',
    question: 'Cual de estas es una variable valida en JavaScript?',
    options: ['let _variableNombre'],
    correctAnswer: 0,
    explanation: 'Las variables pueden comenzar con letra, guion bajo o signo de dolar'
  },
  {
    id: 'var-q3',
    question: 'Que hace la palabra clave const?',
    options: ['Crea una constante que no puede ser reasignada'],
    correctAnswer: 0,
    explanation: 'const declara una constante cuyo valor no puede ser reasignado despues de su inicializacion'
  },
  {
    id: 'var-q4',
    question: 'Cual es la diferencia principal entre let y var?',
    options: ['let tiene scope de bloque, var tiene scope de funcion'],
    correctAnswer: 0,
    explanation: 'let tiene scope de bloque limitado al bloque donde se declara, var tiene scope de funcion'
  },
  {
    id: 'var-q5',
    question: 'Puedes declarar una variable sin asignarle un valor?',
    options: ['Si, tendra el valor undefined'],
    correctAnswer: 0,
    explanation: 'Una variable declarada sin valor inicial tiene automaticamente el valor undefined'
  },
  {
    id: 'var-q6',
    question: 'Cual de estos nombres de variable sigue la convencion camelCase?',
    options: ['nombreUsuario'],
    correctAnswer: 0,
    explanation: 'camelCase empieza con minuscula y cada palabra siguiente empieza con mayuscula'
  },
  {
    id: 'var-q7',
    question: 'Que sucede si intentas usar una variable antes de declararla con let?',
    options: ['Da un error de referencia'],
    correctAnswer: 0,
    explanation: 'let no tiene hoisting como var, intentar usarla antes de declararla causa un ReferenceError'
  },
  {
    id: 'var-q8',
    question: 'Puedes cambiar el valor de una variable declarada con let?',
    options: ['Si, puedes reasignarle cualquier valor'],
    correctAnswer: 0,
    explanation: 'let permite reasignar valores, a diferencia de const que no permite reasignacion'
  },
  {
    id: 'var-q9',
    question: 'Cual es el alcance scope de una variable declarada con let dentro de un bloque if?',
    options: ['Solo dentro del bloque if'],
    correctAnswer: 0,
    explanation: 'let tiene block scope, solo existe dentro del bloque de llaves donde fue declarada'
  },
  {
    id: 'var-q10',
    question: 'Que valor tiene una variable const que almacena un objeto?',
    options: ['La referencia no puede cambiar pero el objeto si puede modificarse'],
    correctAnswer: 0,
    explanation: 'const impide reasignar la referencia, pero las propiedades del objeto pueden modificarse'
  }
];

export const INITIAL_NETWORK: Neuron[] = [
  {
    id: 'variables',
    label: 'Variables',
    position: { x: 200, y: 300 },
    progress: 0,
    status: 'available',
    unlocks: [],
    questions: VARIABLES_QUESTIONS,
    currentQuestionIndex: 0
  }
];

let networkState: Neuron[] = JSON.parse(JSON.stringify(INITIAL_NETWORK));

export function getNetworkState(): Neuron[] {
  return JSON.parse(JSON.stringify(networkState));
}

export function answerQuestion(neuronId: string, answerIndex: number): {
  updatedNeuron: Neuron | null;
  unlockedNeurons: Neuron[];
  isCorrect: boolean;
  isCompleted: boolean;
} {
  const neuron = networkState.find(n => n.id === neuronId);

  if (!neuron || (neuron.status !== 'available' && neuron.status !== 'in_progress')) {
    return { updatedNeuron: null, unlockedNeurons: [], isCorrect: false, isCompleted: false };
  }

  if (neuron.questions.length === 0) {
    return { updatedNeuron: null, unlockedNeurons: [], isCorrect: false, isCompleted: false };
  }

  const currentQuestion = neuron.questions[neuron.currentQuestionIndex];
  const isCorrect = currentQuestion.correctAnswer === answerIndex;

  if (!isCorrect) {
    return {
      updatedNeuron: JSON.parse(JSON.stringify(neuron)),
      unlockedNeurons: [],
      isCorrect: false,
      isCompleted: false
    };
  }

  neuron.currentQuestionIndex += 1;
  const PROGRESS_INCREMENT = 100 / neuron.questions.length;
  neuron.progress = Math.min(neuron.progress + PROGRESS_INCREMENT, 100);

  if (neuron.progress > 0 && neuron.progress < 100) {
    neuron.status = 'in_progress';
  } else if (neuron.progress >= 100) {
    neuron.status = 'dominated';
  }

  const unlockedNeurons: Neuron[] = [];
  const isCompleted = neuron.status === 'dominated';

  if (isCompleted) {
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
    unlockedNeurons: JSON.parse(JSON.stringify(unlockedNeurons)),
    isCorrect: true,
    isCompleted
  };
}

export function resetNetwork(): void {
  networkState = JSON.parse(JSON.stringify(INITIAL_NETWORK));
}
