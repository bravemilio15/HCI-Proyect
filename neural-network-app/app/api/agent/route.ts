import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/data/mock-data';
import { getNetworkState, setNetworkState, resetNetworkState } from '@/lib/state-manager';
import { UpdateNeuronResponse } from '@/domain/neuron.types';

// Define las acciones que el agente puede realizar
type AgentAction =
  | { action: 'GET_NETWORK_STATUS' }
  | { action: 'SUBMIT_ANSWER'; payload: { neuronId: string; answerIndex: number } }
  | { action: 'RESET_NETWORK' };

/**
 * API Endpoint para el Agente de IA (n8n)
 * Este endpoint actúa como una puerta de enlace segura para que un servicio externo
 * pueda interactuar con la lógica de la aplicación.
 */
export async function POST(request: NextRequest) {
  // --- 1. Verificación de Seguridad ---
  const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body: AgentAction = await request.json();

    // --- 2. Router de Acciones ---
    switch (body.action) {
      case 'GET_NETWORK_STATUS': {
        const networkState = await getNetworkState(); // Await
        return NextResponse.json({ success: true, data: { neurons: networkState } });
      }

      case 'SUBMIT_ANSWER': {
        const { neuronId, answerIndex } = body.payload;

        if (!neuronId || typeof answerIndex !== 'number') {
          return NextResponse.json(
            { success: false, error: 'Invalid payload for SUBMIT_ANSWER' },
            { status: 400 }
          );
        }

        const currentState = await getNetworkState(); // Await
        const result = answerQuestion(neuronId, answerIndex, currentState);

        // --- BUG FIX: Persist the new state ---
        await setNetworkState(result.newState);

        const updatedNeuron = result.newState.find(n => n.id === neuronId);
        if (!updatedNeuron) {
          // This case should ideally not be reached if answerQuestion works correctly
          return NextResponse.json(
            { success: false, error: 'Neuron not found after update' },
            { status: 404 }
          );
        }

        const response: UpdateNeuronResponse = {
            success: true,
            neuron: updatedNeuron,
            unlockedNeurons: result.unlockedNeurons.map(n => n.id),
            isCorrect: result.isCorrect,
            isCompleted: result.isCompleted,
            message: result.isCompleted
              ? `Felicidades! Has dominado ${updatedNeuron.label}!`
              : result.isCorrect
              ? 'Respuesta correcta!'
              : 'Respuesta incorrecta, intenta de nuevo'
          };

        return NextResponse.json(response);
      }

      case 'RESET_NETWORK': {
        const networkState = await resetNetworkState(); // Await and use new function
        return NextResponse.json({
          success: true,
          message: 'Red neuronal reiniciada exitosamente',
          data: { neurons: networkState },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to process agent request', details: errorMessage },
      { status: 500 }
    );
  }
}