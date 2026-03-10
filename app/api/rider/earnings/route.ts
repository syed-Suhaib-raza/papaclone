import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    // Mock data - Replace with real database query later
    const earnings = [
      {
        date: '2024-03-10',
        amount: 450.50,
        deliveries: 12,
        bonus: 50,
      },
      {
        date: '2024-03-09',
        amount: 380.00,
        deliveries: 10,
        bonus: 0,
      },
      {
        date: '2024-03-08',
        amount: 420.75,
        deliveries: 11,
        bonus: 30,
      },
    ];

    return NextResponse.json(earnings);
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}