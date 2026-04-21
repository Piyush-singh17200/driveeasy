import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Fuel, Users, Zap, Heart } from 'lucide-react';
import { Car } from '../../types';
import { useState } from 'react';

interface Props {
  car: Car;
  index?: number;
}

const fuelIcons: Record<string, string> = {
  Electric: '⚡', Petrol: '⛽', Diesel: '🛢️', Hybrid: '🔋', CNG: '💨',
};

const categoryColors: Record<string, string> = {
  SUV: 'bg-blue-500/20 text-blue-400',
  Sedan: 'bg-purple-500/20 text-purple-400',
  Luxury: 'bg-amber-500/20 text-amber-400',
  Sports: 'bg-red-500/20 text-red-400',
  Electric: 'bg-green-500/20 text-green-400',
  Hatchback: 'bg-cyan-500/20 text-cyan-400',
  Van: 'bg-orange-500/20 text-orange-400',
};

export default function CarCard({ car, index = 0 }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const primaryImage = car.images?.find(i => i.isPrimary)?.url || car.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="card-hover group"
    >
      {/* Image */}
      <div className="relative h-48 bg-dark-600 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🚗</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${categoryColors[car.category] || 'bg-white/10 text-white/70'}`}>
            {car.category}
          </span>
        </div>

        {/* Availability */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${car.isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs font-medium text-white/80">{car.isAvailable ? 'Available' : 'Booked'}</span>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-primary-500 text-primary-500' : 'text-white/60'}`} />
        </button>
      </div>

      {/* Content */}
      <Link to={`/cars/${car._id}`} className="block p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display font-semibold text-white group-hover:text-primary-400 transition-colors">
              {car.brand} {car.model}
            </h3>
            <p className="text-xs text-white/40 mt-0.5">{car.year} · {car.transmission}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary-400">₹{car.pricePerDay.toLocaleString()}</p>
            <p className="text-xs text-white/40">/day</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-white/50 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          <span>{car.location.city}, {car.location.state}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-white/50 text-xs">
              <span>{fuelIcons[car.fuel]}</span>
              <span>{car.fuel}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50 text-xs">
              <Users className="w-3 h-3" />
              <span>{car.seats}</span>
            </div>
          </div>
          {car.rating.count > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-white/70">{car.rating.average}</span>
              <span className="text-xs text-white/30">({car.rating.count})</span>
            </div>
          ) : (
            <span className="text-xs text-white/30">No reviews</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
