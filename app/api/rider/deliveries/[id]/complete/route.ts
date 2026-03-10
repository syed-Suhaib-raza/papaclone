import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;
    const body = await request.json();

    // Mock response - Replace with real database update later
    const completedDelivery = {
      id: deliveryId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      signature: body.signature || null,
    };

    return NextResponse.json(completedDelivery);
  } catch (error) {
    console.error('Error completing delivery:', error);
    return NextResponse.json(
      { error: 'Failed to complete delivery' },
      { status: 500 }
    );
  }
}