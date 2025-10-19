import { Neuron, Question } from '@/domain/neuron.types';

const VARIABLES_QUESTIONS: Question[] = [
  {
    id: 'var-q1',
    question: 'Que es una variable en programacion?',
    options: [
      'Un contenedor para guardar informacion',
      'Un tipo de bucle',
      'Una pagina web',
      'Un comando para borrar datos'
    ],
    correctAnswer: 0,
    explanation: 'Una variable es como una caja donde guardamos informacion que podemos usar despues en nuestro programa'
  },
  {
    id: 'var-q2',
    question: 'Cual es la forma correcta de crear una variable en JavaScript?',
    options: [
      'let edad = 25',
      'variable edad = 25',
      'crear edad = 25',
      'edad es 25'
    ],
    correctAnswer: 0,
    explanation: 'Usamos "let" seguido del nombre de la variable, el signo =, y el valor que queremos guardar'
  },
  {
    id: 'var-q3',
    question: 'Que hace la palabra clave "const"?',
    options: [
      'Crea una variable que NO puede cambiar su valor',
      'Crea una variable que SI puede cambiar',
      'Borra una variable',
      'Imprime un mensaje en pantalla'
    ],
    correctAnswer: 0,
    explanation: 'const se usa cuando queremos un valor que nunca va a cambiar, como una constante matematica'
  },
  {
    id: 'var-q4',
    question: 'Si escribo: let nombre = "Ana", cual es el valor de la variable?',
    options: [
      '"Ana"',
      'nombre',
      'let',
      'No tiene valor'
    ],
    correctAnswer: 0,
    explanation: 'El valor es lo que esta despues del signo =, en este caso es el texto "Ana"'
  },
  {
    id: 'var-q5',
    question: 'Puedo cambiar el valor de una variable creada con "let"?',
    options: [
      'Si, puedo asignarle un nuevo valor cuando quiera',
      'No, nunca se puede cambiar',
      'Solo si uso la palabra "cambiar"',
      'Solo la primera vez'
    ],
    correctAnswer: 0,
    explanation: 'Las variables con "let" se pueden modificar cuantas veces necesitemos, a diferencia de "const"'
  }
];

const FUNCTIONS_QUESTIONS: Question[] = [
  {
    id: 'func-q1',
    question: 'Que es una funcion en programacion?',
    options: [
      'Un bloque de codigo que hace una tarea especifica',
      'Una variable especial',
      'Un tipo de dato',
      'Un error en el codigo'
    ],
    correctAnswer: 0,
    explanation: 'Una funcion es como una receta: tiene instrucciones que podemos usar una y otra vez'
  },
  {
    id: 'func-q2',
    question: 'Como se crea una funcion simple en JavaScript?',
    options: [
      'function saludar() { }',
      'crear funcion saludar',
      'nueva saludar() { }',
      'def saludar() { }'
    ],
    correctAnswer: 0,
    explanation: 'Usamos la palabra "function", luego el nombre de la funcion, parentesis (), y llaves { }'
  },
  {
    id: 'func-q3',
    question: 'Para que sirve la palabra "return" en una funcion?',
    options: [
      'Para devolver un resultado',
      'Para borrar la funcion',
      'Para repetir la funcion',
      'Para crear una variable'
    ],
    correctAnswer: 0,
    explanation: 'return nos permite que la funcion nos "devuelva" o "entregue" un valor que podemos usar'
  },
  {
    id: 'func-q4',
    question: 'Como ejecuto (llamo) una funcion llamada "mostrarMensaje"?',
    options: [
      'mostrarMensaje()',
      'llamar mostrarMensaje',
      'ejecutar mostrarMensaje',
      'run mostrarMensaje'
    ],
    correctAnswer: 0,
    explanation: 'Para ejecutar una funcion, escribimos su nombre seguido de parentesis ()'
  },
  {
    id: 'func-q5',
    question: 'Que son los parametros de una funcion?',
    options: [
      'Valores que le pasamos a la funcion para que trabaje con ellos',
      'Errores que corrige la funcion',
      'Nombres especiales para funciones',
      'Variables que no se pueden usar'
    ],
    correctAnswer: 0,
    explanation: 'Los parametros son como ingredientes que le damos a la funcion para que haga su trabajo'
  }
];

const LOOPS_QUESTIONS: Question[] = [
  {
    id: 'loop-q1',
    question: 'Que es un bucle en programacion?',
    options: [
      'Un codigo que se repite varias veces',
      'Un tipo de variable',
      'Una funcion especial',
      'Un error que se repite'
    ],
    correctAnswer: 0,
    explanation: 'Un bucle es como hacer la misma tarea una y otra vez, automaticamente'
  },
  {
    id: 'loop-q2',
    question: 'Que hace un bucle "for"?',
    options: [
      'Repite un codigo un numero especifico de veces',
      'Ejecuta el codigo solo una vez',
      'Borra variables',
      'Crea funciones nuevas'
    ],
    correctAnswer: 0,
    explanation: 'El bucle "for" es perfecto cuando sabemos exactamente cuantas veces queremos repetir algo'
  },
  {
    id: 'loop-q3',
    question: 'Cuando usamos un bucle "while"?',
    options: [
      'Cuando queremos repetir algo MIENTRAS una condicion sea verdadera',
      'Solo para imprimir mensajes',
      'Para crear variables',
      'Cuando queremos parar el programa'
    ],
    correctAnswer: 0,
    explanation: 'while sigue repitiendo MIENTRAS (while en ingles) la condicion sea verdadera'
  },
  {
    id: 'loop-q4',
    question: 'Que hace la palabra "break" dentro de un bucle?',
    options: [
      'Detiene el bucle inmediatamente',
      'Hace el bucle mas rapido',
      'Reinicia el bucle desde cero',
      'Crea un nuevo bucle'
    ],
    correctAnswer: 0,
    explanation: 'break es como decir "ALTO, ya no sigas repitiendo", y sale del bucle'
  },
  {
    id: 'loop-q5',
    question: 'Que hace la palabra "continue" en un bucle?',
    options: [
      'Salta a la siguiente repeticion del bucle',
      'Detiene completamente el bucle',
      'Borra el bucle',
      'Duplica el bucle'
    ],
    correctAnswer: 0,
    explanation: 'continue es como decir "salta esta repeticion y continua con la siguiente"'
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

export function setNetworkState(newState: Neuron[]): void {
  networkState = JSON.parse(JSON.stringify(newState));
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
    console.error('[ANSWER-QUESTION] Neuron not found:', neuronId);
    throw new Error(`Neuron not found: ${neuronId}`);
  }

  if (!neuron.questions || neuron.questions.length === 0) {
    console.error('[ANSWER-QUESTION] No questions for neuron:', neuronId);
    throw new Error(`No questions available for neuron: ${neuronId}`);
  }

  if (neuron.currentQuestionIndex >= neuron.questions.length) {
    console.error('[ANSWER-QUESTION] Invalid question index:', neuron.currentQuestionIndex, 'total:', neuron.questions.length);
    throw new Error(`Invalid question index ${neuron.currentQuestionIndex} for neuron ${neuronId}`);
  }

  const currentQuestion = neuron.questions[neuron.currentQuestionIndex];
  const isCorrect = currentQuestion.correctAnswer === answerIndex;

  if (!isCorrect) {
    console.log('[ANSWER-QUESTION] Incorrect answer for', neuronId, 'question', neuron.currentQuestionIndex);
    return {
      newState: networkCopy, // Return copy, not original (importante para evitar referencias)
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
