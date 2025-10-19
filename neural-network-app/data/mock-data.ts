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
    description: 'Una función es un bloque de código reutilizable diseñado para realizar una tarea específica. Las funciones ayudan a organizar el código, hacerlo más legible y evitar la repetición. Puedes definirlas de varias maneras, incluyendo declaraciones de función y funciones flecha.',
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
    description: 'Los bucles, o ciclos, se utilizan para repetir una acción varias veces. Son fundamentales para procesar colecciones de datos, como arrays. JavaScript ofrece varios tipos de bucles, como `for`, `while` y `for...of`, cada uno útil en diferentes escenarios.',
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
    description: 'En programación, una variable es un contenedor para almacenar valores. En JavaScript, puedes usar `var`, `let` y `const` para declararlas, cada una con sus propias reglas de alcance y reasignación. Dominar las variables es el primer paso para escribir código dinámico.',
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

export function answerQuestion(neuronId: string, answerIndex: number, currentState: Neuron[]): {
  newState: Neuron[];
  unlockedNeurons: Neuron[];
  isCorrect: boolean;
  isCompleted: boolean;
} {
  const networkCopy = JSON.parse(JSON.stringify(currentState));
  const neuron = networkCopy.find((n: Neuron) => n.id === neuronId);

  if (!neuron) {
    throw new Error('Neuron not found in provided state');
  }

  const currentQuestion = neuron.questions[neuron.currentQuestionIndex];
  const isCorrect = currentQuestion.correctAnswer === answerIndex;

  if (!isCorrect) {
    return {
      newState: currentState, // Return original state on wrong answer
      unlockedNeurons: [],
      isCorrect: false,
      isCompleted: false,
    };
  }

  neuron.currentQuestionIndex += 1;
  const PROGRESS_INCREMENT = 100 / neuron.questions.length;
  neuron.progress = Math.min(neuron.progress + PROGRESS_INCREMENT, 100);

  const isCompleted = neuron.progress >= 100;
  if (isCompleted) {
    neuron.status = 'dominated';
  } else if (neuron.progress > 0) {
    neuron.status = 'in_progress';
  }

  const unlockedNeuronObjects: Neuron[] = [];
  if (isCompleted) {
    neuron.unlocks.forEach((unlockedId: string) => {
      let targetNeuron = networkCopy.find((n: Neuron) => n.id === unlockedId);
      if (!targetNeuron && LOCKED_NEURONS[unlockedId]) {
        const newNeuron = JSON.parse(JSON.stringify(LOCKED_NEURONS[unlockedId]));
        networkCopy.push(newNeuron);
        unlockedNeuronObjects.push(newNeuron);
      }
    });
  }

  return {
    newState: networkCopy,
    unlockedNeurons: unlockedNeuronObjects,
    isCorrect: true,
    isCompleted,
  };
}

export function resetNetwork(): void {
  // This function still resets the global server state, which is fine for a global reset.
  networkState = JSON.parse(JSON.stringify(INITIAL_NETWORK));
}
