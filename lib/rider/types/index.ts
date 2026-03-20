export type DeliveryStatus = 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'completed' | 'cancelled';
export type RiderStatus = 'active' | 'inactive' | 'offline';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  items: string[];
  distance: number;
  estimatedTime: number;
  payAmount: number;
  status: DeliveryStatus;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
}

export interface DashboardStats {
  totalDeliveries: number;
  completedToday: number;
  activeDeliveries: number;
  totalEarningsToday: number;
  averageRating: number;
  onlineStatus: boolean;
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  status: RiderStatus;
}