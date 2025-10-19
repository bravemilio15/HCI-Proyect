
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { explanationCache } from '@/lib/cache';
import { explanationDeduplicator } from '@/lib/request-deduplication';

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
    const { question, topic } = await request.json();
    if (!question || !topic) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: question and topic are required' },
        { status: 400 }
      );
    }

    // ✅ Generar clave de caché única
    const cacheKey = `explain:${topic}:${question}`;

    // ✅ 1. Verificar caché primero
    const cachedAnswer = explanationCache.get(cacheKey);
    if (cachedAnswer) {
      cacheHits++;
      console.log(`[EXPLAIN-API] ✅ Cache HIT (${cacheHits}/${cacheHits + cacheMisses})`);

      // Headers HTTP de caché para respuestas cacheadas (1 hora)
      return NextResponse.json({
        success: true,
        answer: cachedAnswer,
        cached: true
      }, {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          'X-Cache-Status': 'HIT'
        }
      });
    }

    cacheMisses++;
    console.log(`[EXPLAIN-API] ❌ Cache MISS (${cacheHits}/${cacheHits + cacheMisses})`);

    // ✅ 2. Deduplicar requests simultáneas
    const aiAnswer = await explanationDeduplicator.deduplicate(cacheKey, async () => {
      // ✅ Prompt optimizado - Más corto para reducir tokens
      const systemPrompt = `Eres Axon, tutor de programación para principiantes. Responde SOLO sobre ${topic}.

Reglas:
1. Solo temas de programación sobre ${topic}
2. Si preguntan otra cosa: "Mi especialidad es código. Pregúntame sobre ${topic}!"
3. Respuestas claras, breves (<100 palabras), con ejemplos simples
4. Tono amigable y alentador`;

      // Llamar a la API de Groq
      const completion = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 120, // ✅ Reducido de 150 a 120
        top_p: 1,
      });

      const answer = completion.choices[0]?.message?.content;

      if (!answer) {
        throw new Error('No response from AI');
      }

      // ✅ 3. Guardar en caché (60 minutos - conceptos son más estáticos)
      explanationCache.set(cacheKey, answer, 60);

      return answer;
    });

    // Devolver la respuesta al frontend con headers de caché
    return NextResponse.json({
      success: true,
      answer: aiAnswer,
      cached: false
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Cache-Status': 'MISS'
      }
    });

  } catch (error) {
    console.error('[EXPLAIN-API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to get response from AI', details: errorMessage },
      { status: 500 }
    );
  }
}

// ✅ Endpoint para obtener estadísticas de caché
export async function GET() {
  const stats = explanationCache.getStats();
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
