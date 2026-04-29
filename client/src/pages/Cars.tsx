import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Map as MapIcon, Grid } from 'lucide-react';
import { carsAPI } from '../utils/api';
import { Car, CarFilters } from '../types';
import CarCard from '../components/cars/CarCard';
import CarFiltersPanel from '../components/cars/CarFilters';
import AIChatWidget from '../components/ai/AIChatWidget';
import { useSocket } from '../hooks/useSocket';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'pricePerDay:asc', label: 'Price: Low to High' },
  { value: 'pricePerDay:desc', label: 'Price: High to Low' },
  { value: 'rating.average:desc', label: 'Top Rated' },
];

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [search, setSearch] = useState('');
  const [sortValue, setSortValue] = useState('createdAt:desc');
  const [showMap, setShowMap] = useState(false);
  const { onCarAvailabilityChange } = useSocket();
  const navigate = useNavigate();

  const filters: CarFilters = React.useMemo(() => ({
    city: searchParams.get('city') || undefined,
    category: searchParams.get('category') || undefined,
    fuel: searchParams.get('fuel') || undefined,
    transmission: searchParams.get('transmission') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    seats: searchParams.get('seats') ? Number(searchParams.get('seats')) : undefined,
    available: searchParams.has('available') ? searchParams.get('available') === 'true' : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 12
  }), [searchParams]);

  const setFilters = useCallback((newFiltersOrUpdater: React.SetStateAction<CarFilters>) => {
    const nextFilters = typeof newFiltersOrUpdater === 'function' 
      ? (newFiltersOrUpdater as (prev: CarFilters) => CarFilters)(filters) 
      : newFiltersOrUpdater;

    const nextParams = new URLSearchParams();
    if (nextFilters.city) nextParams.set('city', nextFilters.city);
    if (nextFilters.category) nextParams.set('category', nextFilters.category);
    if (nextFilters.fuel) nextParams.set('fuel', nextFilters.fuel);
    if (nextFilters.transmission) nextParams.set('transmission', nextFilters.transmission);
    if (nextFilters.minPrice) nextParams.set('minPrice', String(nextFilters.minPrice));
    if (nextFilters.maxPrice) nextParams.set('maxPrice', String(nextFilters.maxPrice));
    if (nextFilters.seats) nextParams.set('seats', String(nextFilters.seats));
    if (nextFilters.available !== undefined) nextParams.set('available', String(nextFilters.available));
    if (nextFilters.page && nextFilters.page > 1) nextParams.set('page', String(nextFilters.page));

    setSearchParams(nextParams, { replace: true });
  }, [filters, setSearchParams]);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sortBy, order] = sortValue.split(':');
      const res = await carsAPI.getCars({ ...filters, search: search || undefined, sortBy, order });
      if (res.data && res.data.success) {
        setCars(res.data.cars || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCars(res.data.pagination?.total || 0);
      } else {
        throw new Error(res.data?.error || 'Failed to fetch cars');
      }
    } catch (err) {
      console.error(err);
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, search, sortValue]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Real-time availability updates
  useEffect(() => {
    const unsubscribe = onCarAvailabilityChange(({ carId, isAvailable }) => {
      setCars(prev => prev.map(car => car._id === carId ? { ...car, isAvailable } : car));
    });
    return () => { unsubscribe(); };
  }, [onCarAvailabilityChange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(f => ({ ...f, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setSearch('');
    setSortValue('createdAt:desc');
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Browse Cars</h1>
          <p className="text-white/40 text-sm">
            {isLoading ? 'Searching...' : `${totalCars.toLocaleString()} cars available`}
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brand, model..."
              className="input pl-10"
            />
          </form>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowMap(!showMap)}
              className="btn-ghost flex items-center gap-2 border border-white/5 bg-white/5"
            >
              {showMap ? <><Grid className="w-4 h-4" /> Grid View</> : <><MapIcon className="w-4 h-4" /> Map View</>}
            </button>
            <select
              value={sortValue}
              onChange={e => setSortValue(e.target.value)}
              className="input w-auto min-w-[180px]"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-dark-600">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters */}
          <CarFiltersPanel filters={filters} onChange={setFilters} onReset={resetFilters} />

          {/* Car Grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter trigger - shown inline on mobile */}
            <div className="mb-4 md:hidden">
              {/* The CarFiltersPanel already handles its own mobile trigger */}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="skeleton h-48" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-5 w-3/4 rounded" />
                      <div className="skeleton h-4 w-1/2 rounded" />
                      <div className="skeleton h-4 w-2/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : showMap ? (
              <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-white/5 relative z-0">
                <MapContainer 
                  center={[19.0760, 72.8777]} 
                  zoom={11} 
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {cars.map(car => (
                    car.location?.coordinates && (
                      <Marker key={car._id} position={[car.location.coordinates.lat, car.location.coordinates.lng]}>
                        <Popup>
                          <div className="p-1 min-w-[150px]">
                            <img src={car.images?.[0]?.url} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                            <h4 className="font-bold text-dark-900 leading-tight mb-1">{car.brand} {car.model}</h4>
                            <p className="text-xs text-dark-600 mb-2">₹{car.pricePerDay}/day</p>
                            <button 
                              onClick={() => navigate(`/cars/${car._id}`)}
                              className="w-full py-1.5 bg-primary-500 text-white rounded-lg text-xs font-bold"
                            >
                              View Details
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {cars.map((car, i) => <CarCard key={car._id} car={car} index={i} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                      disabled={(filters.page || 1) <= 1}
                      className="btn-ghost py-2 px-4 disabled:opacity-30"
                    >← Prev</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button key={page} onClick={() => setFilters(f => ({ ...f, page }))}
                          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                            filters.page === page ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}>{page}</button>
                      );
                    })}
                    <button
                      onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))}
                      disabled={(filters.page || 1) >= totalPages}
                      className="btn-ghost py-2 px-4 disabled:opacity-30"
                    >Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <AIChatWidget />
    </div>
  );
}
