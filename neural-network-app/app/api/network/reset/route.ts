import { NextResponse } from 'next/server';
import { resetNetwork, getNetworkState } from '@/data/mock-data';

export async function POST() {
  try {
    resetNetwork();

    const networkState = getNetworkState();

    return NextResponse.json({
      success: true,
      message: 'Red neuronal reiniciada exitosamente',
      data: { neurons: networkState }
    });
  } catch (error) {
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
