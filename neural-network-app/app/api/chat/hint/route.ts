
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { hintCache } from '@/lib/cache';
import { hintDeduplicator } from '@/lib/request-deduplication';

// Inicializar el cliente de Groq
const groq = new Groq();

const MODEL_NAME = 'llama-3.1-8b-instant';

// ✅ Estadísticas de caché para monitoreo
let cacheHits = 0;
let cacheMisses = 0;

export async function POST(request: NextRequest) {
  // Validar que la clave de API exista
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Groq API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Recibir datos del frontend
    const { question, userAnswer, correctAnswer, topic } = await request.json();
    if (!question || !userAnswer || !correctAnswer || !topic) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: All fields are required' },
        { status: 400 }
      );
    }

    // ✅ Generar clave de caché única basada en la pregunta y respuesta incorrecta
    const cacheKey = `hint:${topic}:${question}:${userAnswer}`;

    // ✅ 1. Verificar caché primero
    const cachedHint = hintCache.get(cacheKey);
    if (cachedHint) {
      cacheHits++;
      console.log(`[HINT-API] ✅ Cache HIT (${cacheHits}/${cacheHits + cacheMisses})`);

      // Headers HTTP de caché para respuestas cacheadas (30 minutos)
      return NextResponse.json({
        success: true,
        hint: cachedHint,
        cached: true
      }, {
        headers: {
          'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400',
          'X-Cache-Status': 'HIT'
        }
      });
    }

    cacheMisses++;
    console.log(`[HINT-API] ❌ Cache MISS (${cacheHits}/${cacheHits + cacheMisses})`);

    // ✅ 2. Deduplicar requests simultáneas
    const aiHint = await hintDeduplicator.deduplicate(cacheKey, async () => {
      // ✅ Prompt optimizado - Más corto para reducir tokens
      const systemPrompt = `Eres Axon, tutor socrático. NO des la respuesta directa. Da una pista corta (<40 palabras) para guiar al estudiante.

Tema: ${topic}
Pregunta: "${question}"
Respuesta incorrecta: "${userAnswer}"
Correcta: "${correctAnswer}"

Da solo UNA pista breve y amigable:`;

      // Llamar a la API de Groq
      const completion = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: "Dame una pista." },
        ],
        temperature: 0.7,
        max_tokens: 80, // ✅ Reducido de 100 a 80
        top_p: 1,
      });

      const hint = completion.choices[0]?.message?.content;

      if (!hint) {
        throw new Error('No response from AI');
      }

      // ✅ 3. Guardar en caché (30 minutos)
      hintCache.set(cacheKey, hint, 30);

      return hint;
    });

    // Devolver la pista al frontend con headers de caché
    return NextResponse.json({
      success: true,
      hint: aiHint,
      cached: false
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400',
        'X-Cache-Status': 'MISS'
      }
    });

  } catch (error) {
    console.error('[HINT-API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to get hint from AI', details: errorMessage },
      { status: 500 }
    );
  }
}

// ✅ Endpoint para obtener estadísticas de caché (útil para monitoreo)
export async function GET() {
  const stats = hintCache.getStats();
  return NextResponse.json({
    success: true,
    stats: {
      ...stats,
      cacheHits,
      cacheMisses,
      hitRate: cacheHits + cacheMisses > 0
        ? ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(2) + '%'
        : '0%'
    }
  });
}
