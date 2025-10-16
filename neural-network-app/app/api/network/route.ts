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
    const body: UpdateNeuronRequest = await request.json();

    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: neuron id is required'
        },
        { status: 400 }
      );
    }

    if (body.answerIndex === undefined || typeof body.answerIndex !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: answerIndex is required'
        },
        { status: 400 }
      );
    }

    const { updatedNeuron, unlockedNeurons, isCorrect, isCompleted } = answerQuestion(body.id, body.answerIndex);

    if (!updatedNeuron) {
      return NextResponse.json(
        {
          success: false,
          error: 'Neuron not found or cannot be updated',
          isCorrect: false,
          isCompleted: false
        },
        { status: 404 }
      );
    }

    const response: UpdateNeuronResponse = {
      success: true,
      neuron: updatedNeuron,
      unlockedNeurons: unlockedNeurons.map(n => n.id),
      isCorrect,
      isCompleted,
      message: isCompleted
        ? `Felicidades! Has dominado ${updatedNeuron.label}!`
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
