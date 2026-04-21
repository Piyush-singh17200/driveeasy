import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { bookingsAPI } from '../utils/api';
import { Booking, BookingStatus } from '../types';
import { format } from 'date-fns';

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-white/10 text-white/50',
  cancelled: 'bg-red-500/20 text-red-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const STATUS_TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    bookingsAPI.getBookings({ status: activeStatus || undefined, page, limit: 10 })
      .then(res => {
        setBookings(res.data.bookings);
        setTotalPages(res.data.pagination.pages);
      })
      .finally(() => setIsLoading(false));
  }, [activeStatus, page]);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white mb-6">My Bookings</h1>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => handleStatusChange(tab.value)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeStatus === tab.value ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">📋</span>
            <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
            <p className="text-white/40 mb-6">
              {activeStatus ? `No ${activeStatus} bookings` : "You haven't made any bookings yet"}
            </p>
            <Link to="/cars" className="btn-primary">Browse Cars</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => {
              const car = booking.car as any;
              return (
                <motion.div key={booking._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to={`/bookings/${booking._id}`} className="card-hover p-5 flex gap-4 items-center block">
                    {/* Car Image */}
                    <div className="w-20 h-16 shrink-0 rounded-xl bg-dark-600 overflow-hidden">
                      {car?.images?.[0]?.url ? (
                        <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {car?.brand} {car?.model}
                        </h3>
                        <span className={`badge shrink-0 ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(booking.startDate), 'dd MMM')} – {format(new Date(booking.endDate), 'dd MMM yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}
                        </span>
                        {car?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {car.location.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-primary-400">₹{booking.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-white/40">{booking.paymentStatus}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                  </Link>
                </motion.div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-ghost py-2 px-4 disabled:opacity-30">← Prev</button>
                <span className="px-4 py-2 text-white/50 text-sm">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-ghost py-2 px-4 disabled:opacity-30">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
