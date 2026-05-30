export interface CustomerUser {
  id: number;
  _id: number;
  name: string;
  phone: string;
  role: 'customer';
  status: 'approved';
}

export interface Driver {
  id: number;
  _id: number;
  name: string;
  phone: string;
  route: string;
  avatar?: string;
  region: 'north' | 'central' | 'south';
  isActive: boolean;
  createdAt: string;
}

export interface BookingRequest {
  id: number;
  _id: number;
  name: string;
  phone: string;
  startPoint: string;
  endPoint: string;
  price: number;
  note?: string;
  status: 'waiting' | 'matched' | 'completed';
  region: string;
  createdAt: string;
}
