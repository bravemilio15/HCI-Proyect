import { Neuron, Question } from '@/domain/neuron.types';

const VARIABLES_QUESTIONS: Question[] = [
  {
    id: 'var-q1',
    question: 'Cual es la forma correcta de declarar una variable en JavaScript moderno?',
    options: [
      'let nombre = "Juan"',
      'var nombre = "Juan"'
    ],
    correctAnswer: 0,
    explanation: 'let es la forma moderna y recomendada para declarar variables con scope de bloque'
  },
  {
    id: 'var-q2',
    question: 'Que hace la palabra clave const?',
    options: [
      'Crea una constante que no puede ser reasignada',
      'Crea una variable que puede cambiar libremente'
    ],
    correctAnswer: 0,
    explanation: 'const declara una constante cuyo valor no puede ser reasignado despues de su inicializacion'
  },
  {
    id: 'var-q3',
    question: 'Cual es la diferencia principal entre let y var?',
    options: [
      'let tiene scope de bloque, var tiene scope de funcion',
      'let y var son exactamente iguales'
    ],
    correctAnswer: 0,
    explanation: 'let tiene scope de bloque limitado al bloque donde se declara, var tiene scope de funcion'
  },
  {
    id: 'var-q4',
    question: 'Puedes declarar una variable sin asignarle un valor?',
    options: [
      'Si, tendra el valor undefined',
      'No, siempre debes asignarle un valor inicial'
    ],
    correctAnswer: 0,
    explanation: 'Una variable declarada sin valor inicial tiene automaticamente el valor undefined'
  },
  {
    id: 'var-q5',
    question: 'Puedes cambiar el valor de una variable declarada con let?',
    options: [
      'Si, puedes reasignarle cualquier valor',
      'No, let es inmutable como const'
    ],
    correctAnswer: 0,
    explanation: 'let permite reasignar valores, a diferencia de const que no permite reasignacion'
  }
];

const FUNCTIONS_QUESTIONS: Question[] = [
  {
    id: 'func-q1',
    question: 'Como se declara una funcion en JavaScript?',
    options: [
      'function miFuncion() {}',
      'def miFuncion() {}'
    ],
    correctAnswer: 0,
    explanation: 'Esta es la sintaxis basica para declarar una funcion'
  },
  {
    id: 'func-q2',
    question: 'Que palabra clave se usa para devolver un valor desde una funcion?',
    options: [
      'return',
      'send'
    ],
    correctAnswer: 0,
    explanation: 'return se usa para devolver un valor y terminar la ejecucion de la funcion'
  },
  {
    id: 'func-q3',
    question: 'Como se pasan parametros a una funcion?',
    options: [
      'Se pasan valores entre parentesis al invocarla',
      'Se escriben despues del nombre sin parentesis'
    ],
    correctAnswer: 0,
    explanation: 'Los parametros se pasan entre parentesis cuando se invoca la funcion'
  },
  {
    id: 'func-q4',
    question: 'Cual es la sintaxis de una funcion flecha (arrow function)?',
    options: [
      'const miFuncion = () => {}',
      'arrow miFuncion() {}'
    ],
    correctAnswer: 0,
    explanation: 'Las arrow functions usan la sintaxis () => {} y son mas concisas'
  },
  {
    id: 'func-q5',
    question: 'Una funcion sin return devuelve que valor?',
    options: [
      'undefined',
      'null'
    ],
    correctAnswer: 0,
    explanation: 'Si una funcion no tiene return explicito, devuelve undefined por defecto'
  }
];

const LOOPS_QUESTIONS: Question[] = [
  {
    id: 'loop-q1',
    question: 'Que hace un bucle for?',
    options: [
      'Repite codigo un numero determinado de veces',
      'Ejecuta codigo solo una vez'
    ],
    correctAnswer: 0,
    explanation: 'El bucle for itera un numero especifico de veces'
  },
  {
    id: 'loop-q2',
    question: 'Como se detiene un bucle antes de que termine?',
    options: [
      'Usando la palabra clave break',
      'Usando la palabra clave stop'
    ],
    correctAnswer: 0,
    explanation: 'break termina la ejecucion del bucle inmediatamente'
  },
  {
    id: 'loop-q3',
    question: 'Que hace la palabra clave continue en un bucle?',
    options: [
      'Salta a la siguiente iteracion',
      'Detiene completamente el bucle'
    ],
    correctAnswer: 0,
    explanation: 'continue omite el resto del codigo en la iteracion actual y pasa a la siguiente'
  },
  {
    id: 'loop-q4',
    question: 'Cual es la diferencia entre while y do-while?',
    options: [
      'do-while ejecuta el codigo al menos una vez',
      'while y do-while son exactamente iguales'
    ],
    correctAnswer: 0,
    explanation: 'do-while evalua la condicion despues de ejecutar el bloque, garantizando al menos una ejecucion'
  },
  {
    id: 'loop-q5',
    question: 'Como se itera sobre un array con for-of?',
    options: [
      'for (let item of array) {}',
      'for (let item in array) {}'
    ],
    correctAnswer: 0,
    explanation: 'for-of itera directamente sobre los valores de un array o iterable'
  }
];

const LOCKED_NEURONS: Record<string, Neuron> = {
  functions: {
    id: 'functions',
    label: 'Funciones',
    position: { x: 150, y: 400 },
    progress: 0,
    status: 'available',
    unlocks: [],
    questions: FUNCTIONS_QUESTIONS,
    currentQuestionIndex: 0
  },
  loops: {
    id: 'loops',
    label: 'Bucles',
    position: { x: 350, y: 400 },
    progress: 0,
    status: 'available',
    unlocks: [],
    questions: LOOPS_QUESTIONS,
    currentQuestionIndex: 0
  }
};

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
      let targetNeuron = networkState.find(n => n.id === unlockedId);

      if (!targetNeuron && LOCKED_NEURONS[unlockedId]) {
        console.log('[MOCK-DATA] Adding new neuron to network:', unlockedId);
        const newNeuron = JSON.parse(JSON.stringify(LOCKED_NEURONS[unlockedId]));
        networkState.push(newNeuron);
        targetNeuron = newNeuron;
        unlockedNeurons.push(newNeuron);
        console.log('[MOCK-DATA] NEW NEURON ADDED:', unlockedId);
      } else if (targetNeuron) {
        console.log('[MOCK-DATA] Neuron already exists, checking if blocked:', unlockedId, targetNeuron);
        if (targetNeuron.status === 'blocked') {
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
