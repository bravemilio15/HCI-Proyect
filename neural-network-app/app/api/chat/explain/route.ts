
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// 1. Inicializar el cliente de Groq
// La API Key se lee automáticamente desde la variable de entorno GROQ_API_KEY
const groq = new Groq();

const MODEL_NAME = 'llama-3.1-8b-instant';

export async function POST(request: NextRequest) {
  // 2. Validar que la clave de API exista
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Groq API key not configured' },
      { status: 500 }
    );
  }

  try {
    // 3. Recibir datos del frontend
    const { question, topic } = await request.json();
    if (!question || !topic) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: question and topic are required' },
        { status: 400 }
      );
    }

    // 4. Construir el prompt para la IA en formato de mensajes
    const systemPrompt = `
Eres "Axon", un asistente de IA amigable y paciente integrado en un simulador de aprendizaje 3D. Tu único propósito es ayudar a los estudiantes principiantes a entender conceptos básicos de programación.

Tu personalidad es la de un "tutor entusiasta": eres alentador, usas analogías simples y explicas las cosas paso a paso. No eres un sabelotodo, eres un guía.

## REGLAS ESTRICTAS DE FUNCIONAMIENTO:

1.  **REGLA DE ÁMBITO (SCOPE):** SÓLO puedes responder preguntas relacionadas con la programación (conceptos, sintaxis, lógica, estructuras de datos, etc.) sobre el tema de '${topic}'.
2.  **REGLA DE RECHAZO (REJECTION):** Si el usuario te pregunta CUALQUIER OTRA COSA (historia, geografía, política, ciencia general, matemáticas no aplicadas, quién eres, pedirte chistes, etc.), DEBES RECHAZAR amablemente la solicitud.
3.  **MANTÉN EL FOCO:** Siempre intenta reorientar la conversación de vuelta al concepto de '${topic}'.
4.  **SÉ CONCISO:** Tus respuestas deben ser claras y, en lo posible, breves. Son para principiantes.

## SCRIPT DE RECHAZO:

Cuando un usuario pregunte algo fuera de tu ámbito, debes usar una variación de esta respuesta:
"¡Ups! Mi especialidad es 100% el código. No tengo información sobre [tema que preguntó el usuario]. Pero si tienes alguna duda sobre '${topic}', ¡estoy aquí para ayudarte!"
`;

    // 5. Llamar a la API de Groq
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      );
    }

    // 6. Devolver la respuesta al frontend
    return NextResponse.json({ success: true, answer: aiResponse });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to get response from AI', details: errorMessage },
      { status: 500 }
    );
  }
}
