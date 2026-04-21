import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { CarFilters } from '../../types';

interface Props {
  filters: CarFilters;
  onChange: (filters: CarFilters) => void;
  onReset: () => void;
}

const CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Van', 'Truck', 'Convertible'];
const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT'];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-white/5 pb-4 mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3">
        <h4 className="text-sm font-semibold text-white/80">{title}</h4>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CarFiltersPanel({ filters, onChange, onReset }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (key: keyof CarFilters, value: any) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const activeCount = Object.entries(filters).filter(([k, v]) =>
    !['page', 'limit', 'sortBy', 'order'].includes(k) && v !== undefined && v !== ''
  ).length;

  const content = (
    <div className="space-y-1">
      {/* Price Range */}
      <FilterSection title="Price Range (₹/day)">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label">Min</label>
              <input type="number" className="input text-sm" placeholder="0"
                value={filters.minPrice || ''} onChange={e => update('minPrice', e.target.value ? +e.target.value : undefined)} />
            </div>
            <div className="flex-1">
              <label className="label">Max</label>
              <input type="number" className="input text-sm" placeholder="10000"
                value={filters.maxPrice || ''} onChange={e => update('maxPrice', e.target.value ? +e.target.value : undefined)} />
            </div>
          </div>
          {[1000, 2000, 5000, 10000].map(price => (
            <button key={price} onClick={() => update('maxPrice', price)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filters.maxPrice === price ? 'bg-primary-500/20 text-primary-400' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              Under ₹{price.toLocaleString()}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => update('category', filters.category === cat ? undefined : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filters.category === cat ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection title="Fuel Type">
        <div className="space-y-2">
          {FUELS.map(fuel => (
            <label key={fuel} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={filters.fuel === fuel}
                onChange={() => update('fuel', filters.fuel === fuel ? undefined : fuel)}
                className="w-4 h-4 rounded border-white/20 bg-dark-600 text-primary-500 focus:ring-primary-500/50" />
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">{fuel}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmission">
        <div className="flex gap-2 flex-wrap">
          {TRANSMISSIONS.map(t => (
            <button key={t} onClick={() => update('transmission', filters.transmission === t ? undefined : t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.transmission === t ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-transparent'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Seats */}
      <FilterSection title="Min. Seats">
        <div className="flex gap-2">
          {[2, 4, 5, 7].map(s => (
            <button key={s} onClick={() => update('seats', filters.seats === s ? undefined : s)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.seats === s ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}>
              {s}+
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-white/70">Available Only</span>
        <div className={`w-10 h-5 rounded-full transition-colors relative ${filters.available ? 'bg-primary-500' : 'bg-white/10'}`}
          onClick={() => update('available', !filters.available)}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.available ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
        </div>
      </label>

      {/* Reset */}
      {activeCount > 0 && (
        <button onClick={onReset} className="w-full mt-4 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> Clear Filters ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="sticky top-24 card p-5">{content}</div>
      </div>

      {/* Mobile trigger */}
      <button onClick={() => setMobileOpen(true)}
        className="md:hidden btn-ghost text-sm relative">
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full text-xs flex items-center justify-center">{activeCount}</span>
        )}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-80 bg-dark-800 z-50 md:hidden overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-semibold text-white">Filters</h3>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">{content}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
