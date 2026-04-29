import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Menu, X, Bell, User, LogOut, LayoutDashboard,
  ChevronDown, Settings, Shield, Briefcase
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  const navLinks = [
    { href: '/cars', label: 'Browse Cars' },
    { href: '/cars?category=SUV', label: 'SUVs' },
    { href: '/cars?category=Luxury', label: 'Luxury' },
    { href: '/cars?category=Electric', label: 'Electric' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];
  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner' : '/dashboard';
  const currentPath = `${location.pathname}${location.search}`;
  const isLinkActive = (href: string) => href.includes('?') ? currentPath === href : location.pathname === href;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-dark-800/95 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Drive<span className="text-primary-500">Easy</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLinkActive(link.href)
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Notifications Bell */}
                <Link
                  to={dashboardLink}
                  className="relative p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {user.notifications?.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">{(user.name || 'U')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-white/90">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-dark-700 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-white/40">{user.email}</p>
                          <span className="badge bg-primary-500/20 text-primary-400 mt-1 capitalize">{user.role}</span>
                        </div>
                        <div className="p-1.5">
                          <DropdownItem to={dashboardLink} icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
                          <DropdownItem to="/bookings" icon={<Briefcase className="w-4 h-4" />} label="My Bookings" />
                          <DropdownItem to="/profile" icon={<Settings className="w-4 h-4" />} label="Profile Settings" />
                          {user.role === 'admin' && (
                            <DropdownItem to="/admin" icon={<Shield className="w-4 h-4" />} label="Admin Panel" />
                          )}
                        </div>
                        <div className="p-1.5 border-t border-white/5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-800/98 backdrop-blur-xl border-t border-white/5"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <Link to="/login" className="block text-center px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="block text-center btn-primary text-sm justify-center">
                    Get Started
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="pt-3 border-t border-white/5 space-y-1">
                  <Link to={dashboardLink} className="block px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5">Dashboard</Link>
                  <Link to="/bookings" className="block px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5">Bookings</Link>
                  <Link to="/profile" className="block px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10">Sign Out</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function DropdownItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
      {icon}
      {label}
    </Link>
  );
}
