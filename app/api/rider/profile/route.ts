import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - Replace with real database query later
    const profile = {
      id: '1',
      name: 'Rider Name',
      email: 'rider@example.com',
      phone: '+1 (555) 123-4567',
      rating: 4.8,
      totalDeliveries: 247,
      status: 'active',
      documentVerified: true,
      totalEarnings: 4250.50,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock response - Replace with real database update later
    const updatedProfile = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}