import { NextRequest, NextResponse } from 'next/server';
import { getNetworkState, answerQuestion } from '@/data/mock-data';
import { UpdateNeuronRequest, UpdateNeuronResponse } from '@/domain/neuron.types';

export async function GET() {
  try {
    const networkState = getNetworkState();

    return NextResponse.json({
      success: true,
      data: { neurons: networkState }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch network state',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateNeuronRequest & { currentState: Neuron[] } = await request.json();

    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request: neuron id is required' },
        { status: 400 }
      );
    }

    if (body.answerIndex === undefined || typeof body.answerIndex !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid request: answerIndex is required' },
        { status: 400 }
      );
    }

    if (!body.currentState || !Array.isArray(body.currentState)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: currentState is required' },
        { status: 400 }
      );
    }

    const { newState, unlockedNeurons, isCorrect, isCompleted } = answerQuestion(body.id, body.answerIndex, body.currentState);

    const response = {
      success: true,
      isCorrect,
      isCompleted,
      newState,
      unlockedNeurons: unlockedNeurons.map(n => n.id),
      message: isCompleted
        ? `Felicidades! Has dominado el tema!`
        : isCorrect
        ? 'Respuesta correcta!'
        : 'Respuesta incorrecta, intenta de nuevo'
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update neuron',
        details: errorMessage,
        isCorrect: false,
        isCompleted: false
      },
      { status: 500 }
    );
  }
}
