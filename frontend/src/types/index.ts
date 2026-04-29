// types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  isVerified: boolean;
  isActive: boolean;
  preferences?: {
    carTypes?: string[];
    maxBudget?: number;
    locations?: string[];
  };
  notifications?: Notification[];
  createdAt: string;
  lastLogin?: string;
}

export interface Notification {
  _id: string;
  message: string;
  type: 'booking' | 'payment' | 'system' | 'promotion';
  read: boolean;
  createdAt: string;
}

export interface CarImage {
  url: string;
  publicId?: string;
  isPrimary: boolean;
}

export interface Car {
  _id: string;
  owner: User | string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  transmission: 'Manual' | 'Automatic' | 'CVT';
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
  seats: number;
  pricePerDay: number;
  location: {
    city: string;
    state: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  images: CarImage[];
  features?: string[];
  description?: string;
  isAvailable: boolean;
  isApproved: boolean;
  rating: { average: number; count: number };
  mileage?: string;
  views: number;
  createdAt: string;
}

export type CarCategory = 'Sedan' | 'SUV' | 'Hatchback' | 'Luxury' | 'Sports' | 'Electric' | 'Van' | 'Truck' | 'Convertible';

export interface Booking {
  _id: string;
  user: User | string;
  car: Car | string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  subtotal: number;
  taxes: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentId?: string;
  pickupLocation?: { address?: string; city?: string };
  dropoffLocation?: { address?: string; city?: string };
  specialRequests?: string;
  cancellationReason?: string;
  review?: {
    rating: number;
    comment?: string;
    createdAt: string;
  };
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  method?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  booking: string;
  car: Car | string;
  user: User | string;
  rating: number;
  comment?: string;
  aspects?: {
    cleanliness?: number;
    comfort?: number;
    value?: number;
    performance?: number;
  };
  createdAt: string;
}

export interface CarFilters {
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  fuel?: string;
  transmission?: string;
  seats?: number;
  available?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCars: number;
  totalBookings: number;
  activeBookings: number;
  pendingCars: number;
  totalRevenue: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}
