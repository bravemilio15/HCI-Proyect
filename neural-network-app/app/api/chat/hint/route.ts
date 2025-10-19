
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// 1. Inicializar el cliente de Groq
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
    const { question, userAnswer, correctAnswer, topic } = await request.json();
    if (!question || !userAnswer || !correctAnswer || !topic) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: All fields are required' },
        { status: 400 }
      );
    }

    // 4. Construir el prompt para la IA en formato de mensajes
    const systemPrompt = `
Eres "Axon", un asistente de IA y tutor socrático. Tu único propósito es ayudar a un estudiante a razonar la respuesta correcta por sí mismo.

## REGLAS ESTRICTAS DE FUNCIONAMIENTO:
1.  **NO DES LA RESPUESTA DIRECTA:** Bajo ninguna circunstancia reveles la respuesta correcta.
2.  **HAZ PREGUNTAS GUÍA:** Tu objetivo es hacer una pregunta o dar una analogía que ilumine el error del estudiante y lo guíe hacia el razonamiento correcto.
3.  **SÉ CONCISO Y ALENTADOR:** Usa un tono amigable y mantén tu pista breve.

## CONTEXTO:
El estudiante está aprendiendo sobre '${topic}'. Se le hizo la siguiente pregunta:
**Pregunta:** "${question}"

El estudiante respondió incorrectamente:
**Respuesta del estudiante:** "${userAnswer}"

(Para tu información, la respuesta correcta es: "${correctAnswer}")

## TU MISIÓN:
Basado en el error del estudiante, genera una única pregunta o una pista corta y alentadora que le ayude a reconsiderar su respuesta. No saludes, ve directo a la pista.
`;

    // 5. Llamar a la API de Groq
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Ok, he fallado. Por favor, dame una pista para entenderlo mejor." },
      ],
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
    });

    const aiHint = completion.choices[0]?.message?.content;

    if (!aiHint) {
      return NextResponse.json(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      );
    }

    // 6. Devolver la pista al frontend
    return NextResponse.json({ success: true, hint: aiHint });

  } catch (error) {
    console.error('Error calling Groq API for hint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to get hint from AI', details: errorMessage },
      { status: 500 }
    );
  }
}
