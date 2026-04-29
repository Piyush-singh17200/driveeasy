// BookingDetail page
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, Star, CheckCircle, XCircle, Clock, Loader2, ArrowLeft } from 'lucide-react';
import { bookingsAPI } from '../utils/api';
import { Booking } from '../types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-white/10 text-white/50 border-white/10',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const { user } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    bookingsAPI.getBooking(id)
      .then(res => setBooking(res.data.booking))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setIsCancelling(true);
    try {
      await bookingsAPI.cancelBooking(id!, 'User requested cancellation');
      setBooking(b => b ? { ...b, status: 'cancelled' } : b);
      toast.success('Booking cancelled');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReview = async () => {
    try {
      await bookingsAPI.addReview(id!, review);
      toast.success('Review submitted!');
      setShowReview(false);
      setBooking(b => b ? { ...b, review: { ...review, createdAt: new Date().toISOString() } } : b);
    } catch {}
  };

  const updateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      await bookingsAPI.updateBookingStatus(id!, status);
      setBooking(b => b ? { ...b, status: status as any } : b);
      toast.success(`Booking marked as ${status}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-dark-900 pt-24 flex flex-col items-center justify-center gap-4">
      <span className="text-6xl">📋</span>
      <h2 className="text-xl font-bold text-white">Booking not found</h2>
      <Link to="/bookings" className="btn-primary">My Bookings</Link>
    </div>
  );

  const car = booking.car as any;
  const bookingUser = booking.user as any;
  const isOwner = car?.owner === user?._id || car?.owner?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const isCustomer = bookingUser?._id === user?._id;
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && (isCustomer || isAdmin);
  const canReview = booking.status === 'completed' && !booking.review && isCustomer;

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/bookings')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> My Bookings
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-white">Booking Details</h1>
          <span className={`badge border ${STATUS_STYLES[booking.status]} capitalize`}>
            {booking.status}
          </span>
        </div>

        <div className="space-y-4">
          {/* Car Info */}
          <div className="card p-5 flex gap-4">
            <div className="w-24 h-20 shrink-0 rounded-xl bg-dark-600 overflow-hidden">
              {car?.images?.[0]?.url ? (
                <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />
              ) : <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-white">{car?.brand} {car?.model}</h2>
              <p className="text-white/40 text-sm">{car?.year} · {car?.category}</p>
              {car?.location && (
                <p className="flex items-center gap-1 text-sm text-white/40 mt-1">
                  <MapPin className="w-3 h-3" /> {car.location.city}, {car.location.state}
                </p>
              )}
            </div>
            <Link to={`/cars/${car?._id}`} className="text-primary-400 hover:text-primary-300 text-sm font-medium shrink-0">View Car</Link>
          </div>

          {/* Dates */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4">Booking Period</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-white/40 mb-1">Pickup</p>
                <p className="font-semibold text-white">{format(new Date(booking.startDate), 'dd MMM yyyy')}</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Clock className="w-5 h-5 text-primary-400 mb-1" />
                <p className="text-primary-400 font-bold">{booking.totalDays} days</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Return</p>
                <p className="font-semibold text-white">{format(new Date(booking.endDate), 'dd MMM yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/60">
                <span>₹{booking.pricePerDay.toLocaleString()} × {booking.totalDays} days</span>
                <span>₹{booking.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>GST (18%)</span>
                <span>₹{booking.taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span className="text-primary-400">₹{booking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/40 text-xs pt-1">
                <span>Payment Status</span>
                <span className={booking.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info (Owner/Admin only) */}
          {(isOwner || isAdmin) && bookingUser && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Customer Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Name</span>
                  <span className="text-white">{bookingUser.name}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Email</span>
                  <span className="text-white">{bookingUser.email}</span>
                </div>
                {bookingUser.phone && (
                  <div className="flex justify-between text-white/60">
                    <span>Phone</span>
                    <span className="text-white">{bookingUser.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-2">Special Requests</h3>
              <p className="text-white/50 text-sm">{booking.specialRequests}</p>
            </div>
          )}

          {/* Review */}
          {booking.review && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-3">Your Review</h3>
              <div className="flex gap-1 mb-2">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < booking.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                ))}
              </div>
              {booking.review.comment && <p className="text-white/60 text-sm">{booking.review.comment}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {canCancel && (
              <button onClick={handleCancel} disabled={isCancelling}
                className="flex-1 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Cancel Booking
              </button>
            )}
            {canReview && !showReview && (
              <button onClick={() => setShowReview(true)}
                className="flex-1 py-3 btn-primary justify-center">
                <Star className="w-4 h-4" /> Leave Review
              </button>
            )}
            {(isOwner || isAdmin) && booking.status === 'pending' && (
              <>
                <button onClick={() => updateStatus('confirmed')} disabled={isUpdating} className="flex-1 py-3 btn-primary justify-center bg-blue-500 hover:bg-blue-600">
                  Accept Booking
                </button>
                <button onClick={() => updateStatus('rejected')} disabled={isUpdating} className="flex-1 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors">
                  Reject
                </button>
              </>
            )}
            {(isOwner || isAdmin) && booking.status === 'confirmed' && (
              <button onClick={() => updateStatus('active')} disabled={isUpdating} className="flex-1 py-3 btn-primary justify-center bg-green-500 hover:bg-green-600">
                Mark as Active
              </button>
            )}
            {(isOwner || isAdmin) && booking.status === 'active' && (
              <button onClick={() => updateStatus('completed')} disabled={isUpdating} className="flex-1 py-3 btn-primary justify-center">
                Complete Booking
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <h3 className="font-semibold text-white mb-4">Write a Review</h3>
              <div className="flex gap-2 mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <button key={i} onClick={() => setReview(r => ({ ...r, rating: i + 1 }))}>
                    <Star className={`w-7 h-7 transition-colors ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20 hover:text-amber-400/50'}`} />
                  </button>
                ))}
              </div>
              <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                placeholder="Share your experience..." rows={3} className="input resize-none mb-3 text-sm" />
              <div className="flex gap-2">
                <button onClick={() => setShowReview(false)} className="btn-ghost flex-1 justify-center text-sm py-2.5">Cancel</button>
                <button onClick={handleReview} className="btn-primary flex-1 justify-center text-sm py-2.5">Submit Review</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
