import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;

    // Mock response - Replace with real database update later
    const rejectedDelivery = {
      id: deliveryId,
      status: 'cancelled',
      rejectedAt: new Date().toISOString(),
    };

    return NextResponse.json(rejectedDelivery);
  } catch (error) {
    console.error('Error rejecting delivery:', error);
    return NextResponse.json(
      { error: 'Failed to reject delivery' },
      { status: 500 }
    );
  }
}