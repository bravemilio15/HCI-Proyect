import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/data/mock-data';
import { getNetworkState, setNetworkState } from '@/lib/state-manager';
import { UpdateNeuronRequest } from '@/domain/neuron.types';

export async function GET() {
  try {
    const networkState = await getNetworkState();

    return NextResponse.json({
      success: true,
      data: { neurons: networkState }
    });
  } catch (error) {
    console.error('[NETWORK-API-GET] Error fetching network state:', error);
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
    const body: UpdateNeuronRequest = await request.json();

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

    const currentState = await getNetworkState();
    const { newState, unlockedNeurons, isCorrect, isCompleted } = answerQuestion(body.id, body.answerIndex, currentState);

    // Guardar el nuevo estado en el almacenamiento persistente
    await setNetworkState(newState);

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
    console.error('[NETWORK-API-POST] Error processing answer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update neuron',
        details: errorMessage,
        stack: errorStack,
        isCorrect: false,
        isCompleted: false
      },
      { status: 500 }
    );
  }
}