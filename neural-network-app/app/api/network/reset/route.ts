import { NextResponse } from 'next/server';
import { resetNetworkState } from '@/lib/state-manager';

export async function POST() {
  try {
    const newNetworkState = await resetNetworkState();

    return NextResponse.json({
      success: true,
      message: 'Red neuronal reiniciada exitosamente',
      data: { neurons: newNetworkState }
    });
  } catch (error) {
    console.error('[RESET-API] Error resetting network:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset network',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}