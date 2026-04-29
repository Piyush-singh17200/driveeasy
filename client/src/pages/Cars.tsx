import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { carsAPI } from '../utils/api';
import { Car, CarFilters } from '../types';
import CarCard from '../components/cars/CarCard';
import CarFiltersPanel from '../components/cars/CarFilters';
import AIChatWidget from '../components/ai/AIChatWidget';
import { useSocket } from '../hooks/useSocket';

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
  const { onCarAvailabilityChange } = useSocket();

  const [filters, setFilters] = useState<CarFilters>({
    city: searchParams.get('city') || undefined,
    category: searchParams.get('category') || undefined,
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    setFilters(prev => {
      const city = searchParams.get('city') || undefined;
      const category = searchParams.get('category') || undefined;
      const page = Number(searchParams.get('page')) || 1;
      
      // Only update if there's an actual change to prevent re-render loops
      if (prev.city === city && prev.category === category && prev.page === page) {
        return prev;
      }
      
      return {
        ...prev,
        city,
        category,
        page,
        limit: 12,
      };
    });
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (filters.city) nextParams.set('city', filters.city);
    if (filters.category) nextParams.set('category', filters.category);
    if (filters.fuel) nextParams.set('fuel', filters.fuel);
    if (filters.transmission) nextParams.set('transmission', filters.transmission);
    if (filters.minPrice) nextParams.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) nextParams.set('maxPrice', String(filters.maxPrice));
    if (filters.seats) nextParams.set('seats', String(filters.seats));
    if (filters.available !== undefined) nextParams.set('available', String(filters.available));
    if (filters.page && filters.page > 1) nextParams.set('page', String(filters.page));

    // Sort keys to ensure stable comparison
    nextParams.sort();
    const currentParams = new URLSearchParams(searchParams);
    currentParams.sort();

    if (nextParams.toString() !== currentParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

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
            ) : cars.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl mb-4 block">🚗</span>
                <h3 className="text-xl font-semibold text-white mb-2">No cars found</h3>
                <p className="text-white/40 mb-6">Try adjusting your filters or search in a different city</p>
                <button onClick={resetFilters} className="btn-primary">Clear All Filters</button>
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
