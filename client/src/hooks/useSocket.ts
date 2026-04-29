import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

let socket: Socket | null = null;
const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      socket = io(socketUrl, {
        withCredentials: false,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      if (isAuthenticated && user) {
        socket?.emit('join_user_room', user._id);
        if (user.role === 'admin') socket?.emit('join_admin_room');
        if (user.role === 'owner') socket?.emit('join_owner_room', user._id);
      }
    });

    socket.on('booking_created', (data) => {
      toast.success(data.message || 'Booking created!', { duration: 5000 });
    });

    socket.on('booking_status_updated', (data) => {
      const icons: Record<string, string> = {
        confirmed: '✅', cancelled: '❌', rejected: '🚫', active: '🚗', completed: '🏁',
      };
      toast(`${icons[data.status] || '📋'} ${data.message}`, { duration: 6000 });
    });

    socket.on('new_booking', (data) => {
      toast(`🆕 New booking for ${data.carName} by ${data.userName}`, { duration: 6000 });
    });

    socket.on('payment_success', (data) => {
      toast.success(data.message || 'Payment successful!', { duration: 5000 });
    });

    socket.on('car_approval_status', (data) => {
      if (data.approved) {
        toast.success(`✅ ${data.carName} has been approved!`);
      } else {
        toast.error(`❌ ${data.carName} was not approved.`);
      }
    });

    return () => {
      socket?.off('connect');
      socket?.off('booking_created');
      socket?.off('booking_status_updated');
      socket?.off('new_booking');
      socket?.off('payment_success');
      socket?.off('car_approval_status');
    };
  }, [isAuthenticated, user]);

  const watchCar = useCallback((carId: string) => {
    socket?.emit('watch_car', carId);
  }, []);

  const unwatchCar = useCallback((carId: string) => {
    socket?.emit('unwatch_car', carId);
  }, []);

  const onCarAvailabilityChange = useCallback((callback: (data: any) => void) => {
    socket?.on('car_availability_changed', callback);
    return () => { socket?.off('car_availability_changed', callback); };
  }, []);

  return { socket: socketRef.current, watchCar, unwatchCar, onCarAvailabilityChange };
};
