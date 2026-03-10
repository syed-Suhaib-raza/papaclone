import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;

    // Mock response - Replace with real database update later
    const updatedDelivery = {
      id: deliveryId,
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error('Error accepting delivery:', error);
    return NextResponse.json(
      { error: 'Failed to accept delivery' },
      { status: 500 }
    );
  }
}