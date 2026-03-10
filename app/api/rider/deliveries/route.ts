import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');

    // Mock data - Replace with real database query later
    const mockDeliveries = [
      {
        id: '1',
        orderId: 'ORD-001',
        status: status === 'active' ? 'accepted' : 'pending',
        pickupLocation: {
          latitude: 40.7128,
          longitude: -74.006,
          address: 'Pizza Palace Restaurant, NY',
        },
        dropoffLocation: {
          latitude: 40.715,
          longitude: -74.008,
          address: '123 Main St, Apt 4B, NY',
        },
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        restaurantName: 'Pizza Palace',
        items: ['Margherita Pizza', 'Coca Cola'],
        distance: 2.5,
        estimatedTime: 15,
        payAmount: 45.50,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        orderId: 'ORD-002',
        status: status === 'active' ? 'in_transit' : 'pending',
        pickupLocation: {
          latitude: 40.73,
          longitude: -74.0,
          address: 'Burger House, NY',
        },
        dropoffLocation: {
          latitude: 40.74,
          longitude: -73.99,
          address: '456 Park Ave, NY',
        },
        customerName: 'Jane Smith',
        customerPhone: '+0987654321',
        restaurantName: 'Burger House',
        items: ['Cheese Burger', 'Fries', 'Sprite'],
        distance: 1.8,
        estimatedTime: 12,
        payAmount: 38.00,
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(mockDeliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}