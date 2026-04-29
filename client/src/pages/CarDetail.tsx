import PaymentModal from '../components/ui/PaymentModal';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  MapPin, Star, Fuel, Users, Calendar, Shield, ChevronLeft,
  Heart, Share2, Zap, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { carsAPI, bookingsAPI } from '../utils/api';
import { Car } from '../types';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const { watchCar, unwatchCar, onCarAvailabilityChange } = useSocket();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [specialRequests, setSpecialRequests] = useState('');
const [showPayment, setShowPayment] = useState(false);
const [currentBookingId, setCurrentBookingId] = useState('');
const [bookingAmount, setBookingAmount] = useState(0);
  useEffect(() => {
    if (!id) return;
    carsAPI.getCar(id)
      .then(res => { setCar(res.data.car); setIsAvailable(res.data.car.isAvailable); })
      .catch(() => toast.error('Car not found'))
      .finally(() => setIsLoading(false));

    watchCar(id);
    const unsubscribe = onCarAvailabilityChange(({ carId, isAvailable: avail }) => {
      if (carId === id) {
        setIsAvailable(avail);
        if (!avail) toast('⚡ This car was just booked by someone else!', { icon: '🔴' });
      }
    });
    return () => { unwatchCar(id); unsubscribe(); };
  }, [id]);

  const totalDays = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) : 0;
  const subtotal = totalDays * (car?.pricePerDay || 0);
  const taxes = Math.round(subtotal * 0.18);
  const total = subtotal + taxes;

 const handleBook = async () => {
  if (!isAuthenticated) return navigate('/login');
  if (!startDate || !endDate) return toast.error('Please select booking dates');
  if (!isAvailable) return toast.error('Car is not available');

  setIsBooking(true);
  try {
    const res = await bookingsAPI.createBooking({
      carId: id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      specialRequests,
    });
    setCurrentBookingId(res.data.booking._id);
    setBookingAmount(total);
    setShowPayment(true);
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Booking failed');
  } finally {
    setIsBooking(false);
  }
};

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
    </div>
  );

  if (!car) return (
    <div className="min-h-screen bg-dark-900 pt-24 flex flex-col items-center justify-center gap-4">
      <span className="text-6xl">🚫</span>
      <h2 className="text-xl font-bold text-white">Car not found</h2>
      <Link to="/cars" className="btn-primary">Browse Cars</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mt-6 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to results
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — Images + Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-72 sm:h-96 bg-dark-600">
                {car.images?.[activeImg]?.url ? (
                  <img src={car.images[activeImg].url} alt={car.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">🚗</div>
                )}

                {/* Availability badge */}
                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm ${
                  isAvailable ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {isAvailable ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {isAvailable ? 'Available' : 'Not Available'}
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors">
                    <Heart className="w-5 h-5 text-white/70" />
                  </button>
                  <button className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors">
                    <Share2 className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {car.images?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {car.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImg === i ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-primary-500/20 text-primary-400">{car.category}</span>
                    <span className="badge bg-white/5 text-white/50">{car.year}</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{car.brand} {car.model}</h1>
                  {car.rating.count > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-white">{car.rating.average}</span>
                      <span className="text-white/40 text-sm">({car.rating.count} reviews)</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-400">₹{car.pricePerDay.toLocaleString()}</p>
                  <p className="text-white/40 text-sm">/day</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-white/50 text-sm mb-6">
                <MapPin className="w-4 h-4" />
                {car.location.address && `${car.location.address}, `}{car.location.city}, {car.location.state}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Fuel', value: car.fuel, icon: '⛽' },
                  { label: 'Seats', value: `${car.seats} Seater`, icon: '👥' },
                  { label: 'Transmission', value: car.transmission, icon: '⚙️' },
                  { label: 'Mileage', value: car.mileage || 'N/A', icon: '📍' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-dark-600 rounded-xl p-3 text-center">
                    <span className="text-xl">{icon}</span>
                    <p className="text-xs text-white/40 mt-1">{label}</p>
                    <p className="text-sm font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map(feature => (
                      <span key={feature} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-600 rounded-full text-xs text-white/70">
                        <Zap className="w-3 h-3 text-primary-400" /> {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {car.description && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <h3 className="font-semibold text-white mb-2">About this car</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{car.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Booking Widget */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <h2 className="font-display text-xl font-bold text-white mb-5">Book This Car</h2>

                {/* Date Pickers */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="label">Pickup Date</label>
                    <DatePicker
                      selected={startDate}
                      onChange={date => { setStartDate(date); if (endDate && date && date >= endDate) setEndDate(null); }}
                      minDate={new Date()}
                      placeholderText="Select start date"
                      className="input w-full"
                      dateFormat="dd MMM yyyy"
                    />
                  </div>
                  <div>
                    <label className="label">Return Date</label>
                    <DatePicker
                      selected={endDate}
                      onChange={date => setEndDate(date)}
                      minDate={startDate ? new Date(startDate.getTime() + 86400000) : new Date()}
                      placeholderText="Select end date"
                      className="input w-full"
                      dateFormat="dd MMM yyyy"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mb-4">
                  <label className="label">Special Requests (optional)</label>
                  <textarea
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    placeholder="Child seat, GPS, etc."
                    rows={2}
                    className="input resize-none text-sm"
                  />
                </div>

                {/* Price Breakdown */}
                {totalDays > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-600 rounded-xl p-4 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between text-white/60">
                      <span>₹{car.pricePerDay.toLocaleString()} × {totalDays} day{totalDays > 1 ? 's' : ''}</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>GST (18%)</span>
                      <span>₹{taxes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10 text-base">
                      <span>Total</span>
                      <span className="text-primary-400">₹{total.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleBook}
                  disabled={isBooking || !isAvailable || !startDate || !endDate}
                  className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50"
                >
                  {isBooking ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</> :
                    !isAvailable ? 'Not Available' : 'Book Now'}
                </button>

                {!isAuthenticated && (
                  <p className="text-xs text-white/40 text-center mt-3">
                    <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link> to book this car
                  </p>
                )}

                {/* Trust indicators */}
                <div className="mt-5 pt-5 border-t border-white/5 space-y-2">
                  {[
                    { icon: Shield, text: 'Free cancellation up to 24hrs' },
                    { icon: Zap, text: 'Instant booking confirmation' },
                    { icon: Star, text: 'All cars verified & insured' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-white/40">
                      <Icon className="w-3.5 h-3.5 text-green-400" />
                      {text}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
