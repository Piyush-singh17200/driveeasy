import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Shield, Zap, Star, ChevronRight, Car, Users, Clock, ArrowRight } from 'lucide-react';
import { carsAPI } from '../utils/api';
import { Car as CarType } from '../types';
import CarCard from '../components/cars/CarCard';
import AIChatWidget from '../components/ai/AIChatWidget';

const CATEGORIES = [
  { label: 'SUV', icon: '🚙', desc: 'Spacious & Powerful' },
  { label: 'Sedan', icon: '🚗', desc: 'Elegant & Smooth' },
  { label: 'Luxury', icon: '🏎️', desc: 'Premium Experience' },
  { label: 'Electric', icon: '⚡', desc: 'Eco Friendly' },
  { label: 'Sports', icon: '🚀', desc: 'Thrilling Drive' },
  { label: 'Hatchback', icon: '🚘', desc: 'City Perfect' },
];

const STATS = [
  { value: '500+', label: 'Cars Available', icon: Car },
  { value: '10K+', label: 'Happy Customers', icon: Users },
  { value: '50+', label: 'Cities Covered', icon: MapPin },
  { value: '4.9', label: 'Average Rating', icon: Star },
];

export default function Home() {
  const [searchCity, setSearchCity] = useState('');
  const [featuredCars, setFeaturedCars] = useState<CarType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    carsAPI.getCars({ limit: 6, sortBy: 'rating.average', order: 'desc' })
      .then(res => setFeaturedCars(res.data.cars))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/cars${searchCity ? `?city=${searchCity}` : ''}`);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-hero-pattern">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-900/20 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 font-medium mb-6">
                  <Zap className="w-4 h-4" /> AI-Powered Car Rental
                </span>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                  Drive Your
                  <br />
                  <span className="gradient-text">Perfect Car</span>
                  <br />
                  Today
                </h1>
                <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-md">
                  Real-time availability, instant booking, and AI-powered recommendations. 
                  Find your ideal ride in seconds.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-md">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      value={searchCity}
                      onChange={e => setSearchCity(e.target.value)}
                      placeholder="Enter your city..."
                      className="input pl-10 py-4"
                    />
                  </div>
                  <button type="submit" className="btn-primary px-6 shrink-0">
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </form>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-4">
                  {[
                    { icon: Shield, text: 'Verified Cars' },
                    { icon: Zap, text: 'Instant Booking' },
                    { icon: Clock, text: '24/7 Support' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-white/50 text-sm">
                      <Icon className="w-4 h-4 text-primary-400" />
                      {text}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Hero Car Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-80 h-80 bg-primary-500/10 rounded-full flex items-center justify-center animate-float">
                  <div className="w-64 h-64 bg-primary-500/15 rounded-full flex items-center justify-center">
                    <span className="text-[140px] drop-shadow-2xl">🚗</span>
                  </div>
                </div>
                {/* Floating cards */}
                {[
                  { pos: '-top-4 -left-8', content: '⭐ 4.9 Rating', delay: 0 },
                  { pos: '-bottom-4 -right-8', content: '⚡ Instant Book', delay: 1 },
                  { pos: 'top-1/2 -right-12', content: '🚗 500+ Cars', delay: 2 },
                ].map(({ pos, content, delay }) => (
                  <motion.div key={content} className={`absolute ${pos} glass px-3 py-2 rounded-xl text-sm text-white font-medium`}
                    animate={{ y: [0, -8, 0] }} transition={{ duration: 3, delay, repeat: Infinity }}>
                    {content}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-dark-700/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <Icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-white/40">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="section-title text-white mb-3">Browse by Category</h2>
          <p className="text-white/40">Find the right car for every journey</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ label, icon, desc }, i) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/cars?category=${label}`}
                className="card-hover p-5 text-center group flex flex-col items-center gap-3 block">
                <span className="text-4xl group-hover:scale-110 transition-transform">{icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title text-white mb-2">Top Rated Cars</h2>
              <p className="text-white/40">Handpicked by our AI for the best experience</p>
            </div>
            <Link to="/cars" className="btn-ghost text-sm hidden md:flex">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card h-72">
                  <div className="skeleton h-48 rounded-none" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car, i) => <CarCard key={car._id} car={car} index={i} />)}
            </div>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/cars" className="btn-ghost">View All Cars <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="section-title text-white mb-3">How DriveEasy Works</h2>
          <p className="text-white/40">Get your car in 3 simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
          {[
            { step: '01', title: 'Search & Filter', desc: 'Browse hundreds of verified cars with powerful filters. Use AI assistant for instant recommendations.', icon: Search },
            { step: '02', title: 'Book Instantly', desc: 'Select dates, confirm details, and pay securely. Get instant confirmation via email.', icon: Zap },
            { step: '03', title: 'Drive Away', desc: 'Pick up your car at the agreed location. Return it hassle-free after your trip.', icon: Car },
          ].map(({ step, title, desc, icon: Icon }, i) => (
            <motion.div key={step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="text-center relative">
              <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon className="w-7 h-7 text-primary-400" />
              </div>
              <span className="text-6xl font-display font-bold text-white/5 absolute -top-4 left-1/2 -translate-x-1/2 select-none">{step}</span>
              <h3 className="font-display text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600/20 via-dark-700 to-dark-800 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title text-white mb-4">Own a Car? List It & Earn</h2>
            <p className="text-white/50 mb-8 text-lg">Turn your idle car into a passive income stream. Join 1,000+ owners on DriveEasy.</p>
            <Link to="/register?role=owner" className="btn-primary text-base py-4 px-8 inline-flex">
              Start Earning Today <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
