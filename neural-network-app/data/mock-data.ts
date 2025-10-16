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

const FUNCTIONS_QUESTIONS: Question[] = [
  {
    id: 'func-q1',
    question: 'Como se declara una funcion en JavaScript?',
    options: ['function miFuncion() {}'],
    correctAnswer: 0,
    explanation: 'Esta es la sintaxis basica para declarar una funcion'
  }
];

const LOOPS_QUESTIONS: Question[] = [
  {
    id: 'loop-q1',
    question: 'Que hace un bucle for?',
    options: ['Repite codigo un numero determinado de veces'],
    correctAnswer: 0,
    explanation: 'El bucle for itera un numero especifico de veces'
  }
];

export const INITIAL_NETWORK: Neuron[] = [
  {
    id: 'variables',
    label: 'Variables',
    position: { x: 250, y: 250 },
    progress: 0,
    status: 'available',
    unlocks: ['functions', 'loops'],
    questions: VARIABLES_QUESTIONS,
    currentQuestionIndex: 0
  },
  {
    id: 'functions',
    label: 'Funciones',
    position: { x: 150, y: 400 },
    progress: 0,
    status: 'blocked',
    unlocks: [],
    questions: FUNCTIONS_QUESTIONS,
    currentQuestionIndex: 0
  },
  {
    id: 'loops',
    label: 'Bucles',
    position: { x: 350, y: 400 },
    progress: 0,
    status: 'blocked',
    unlocks: [],
    questions: LOOPS_QUESTIONS,
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
  console.log('[MOCK-DATA] answerQuestion called:', { neuronId, answerIndex });
  const neuron = networkState.find(n => n.id === neuronId);

  if (!neuron || (neuron.status !== 'available' && neuron.status !== 'in_progress')) {
    console.log('[MOCK-DATA] Neuron not found or not interactive:', neuron);
    return { updatedNeuron: null, unlockedNeurons: [], isCorrect: false, isCompleted: false };
  }

  if (neuron.questions.length === 0) {
    console.log('[MOCK-DATA] No questions available');
    return { updatedNeuron: null, unlockedNeurons: [], isCorrect: false, isCompleted: false };
  }

  const currentQuestion = neuron.questions[neuron.currentQuestionIndex];
  const isCorrect = currentQuestion.correctAnswer === answerIndex;
  console.log('[MOCK-DATA] Answer check:', { isCorrect, currentQuestionIndex: neuron.currentQuestionIndex });

  if (!isCorrect) {
    console.log('[MOCK-DATA] Wrong answer');
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

  console.log('[MOCK-DATA] Progress updated:', {
    progress: neuron.progress,
    increment: PROGRESS_INCREMENT,
    currentQuestionIndex: neuron.currentQuestionIndex,
    totalQuestions: neuron.questions.length
  });

  if (neuron.progress > 0 && neuron.progress < 100) {
    neuron.status = 'in_progress';
    console.log('[MOCK-DATA] Status changed to in_progress');
  } else if (neuron.progress >= 100) {
    neuron.status = 'dominated';
    console.log('[MOCK-DATA] Status changed to DOMINATED');
  }

  const unlockedNeurons: Neuron[] = [];
  const isCompleted = neuron.status === 'dominated';

  if (isCompleted) {
    console.log('[MOCK-DATA] Neuron completed! Unlocking:', neuron.unlocks);
    neuron.unlocks.forEach(unlockedId => {
      const targetNeuron = networkState.find(n => n.id === unlockedId);
      console.log('[MOCK-DATA] Checking unlock for:', unlockedId, targetNeuron);
      if (targetNeuron && targetNeuron.status === 'blocked') {
        const allPrerequisitesDominated = networkState
          .filter(n => n.unlocks.includes(unlockedId))
          .every(prereq => prereq.status === 'dominated');

        console.log('[MOCK-DATA] Prerequisites check:', {
          unlockedId,
          allPrerequisitesDominated
        });

        if (allPrerequisitesDominated) {
          targetNeuron.status = 'available';
          unlockedNeurons.push(targetNeuron);
          console.log('[MOCK-DATA] UNLOCKED:', unlockedId);
        }
      }
    });
  }

  console.log('[MOCK-DATA] Final result:', {
    progress: neuron.progress,
    status: neuron.status,
    isCompleted,
    unlockedCount: unlockedNeurons.length,
    unlockedIds: unlockedNeurons.map(n => n.id)
  });

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
