import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - Replace with real database query later
    const stats = {
      totalDeliveries: 247,
      completedToday: 12,
      activeDeliveries: 2,
      totalEarningsToday: 450.50,
      averageRating: 4.8,
      onlineStatus: true,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}