const API_BASE = '/api/rider';

export const riderAPI = {
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  getActiveDeliveries: async () => {
    const res = await fetch(`${API_BASE}/deliveries?status=active`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch deliveries');
    return res.json();
  },

  getDeliveryDetails: async (deliveryId: string) => {
    const res = await fetch(`${API_BASE}/deliveries/${deliveryId}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch delivery');
    return res.json();
  },

  acceptDelivery: async (deliveryId: string) => {
    const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to accept delivery');
    return res.json();
  },

  rejectDelivery: async (deliveryId: string) => {
    const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to reject delivery');
    return res.json();
  },

  completeDelivery: async (deliveryId: string, signature?: string) => {
    const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature }),
    });
    if (!res.ok) throw new Error('Failed to complete delivery');
    return res.json();
  },

  updateLocation: async (latitude: number, longitude: number) => {
    const res = await fetch(`${API_BASE}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });
    if (!res.ok) throw new Error('Failed to update location');
    return res.json();
  },

  getEarnings: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`${API_BASE}/earnings?${params}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch earnings');
    return res.json();
  },

  getRiderProfile: async () => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  updateRiderProfile: async (data: any) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
};