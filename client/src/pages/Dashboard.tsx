import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Calendar, Star, User, TrendingUp, Shield, Users, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { adminAPI, bookingsAPI } from '../utils/api';
import { format } from 'date-fns';

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'owner') return <OwnerDashboard />;
  return <UserDashboard />;
}

function UserDashboard() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-white/40 mt-1">Here's an overview of your DriveEasy activity</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: '—', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Active Rentals', value: '—', icon: Car, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Reviews Given', value: '—', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Profile', value: user?.role, icon: User, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-white capitalize">{value}</p>
              <p className="text-sm text-white/40">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/bookings" className="card-hover p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">My Bookings</h3>
              <p className="text-sm text-white/40">View and manage your rentals</p>
            </div>
          </Link>
          <Link to="/cars" className="card-hover p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Browse Cars</h3>
              <p className="text-sm text-white/40">Find and book your next car</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      adminAPI.getDashboard(),
      adminAPI.getBookings({ limit: 20 }),
      adminAPI.getUsers({ limit: 20 }),
      adminAPI.getCars({ limit: 20 }),
    ]).then(([dashRes, bookRes, userRes, carRes]) => {
      setStats(dashRes.data.stats);
      setBookings(bookRes.data.bookings);
      setUsers(userRes.data.users);
      setCars(carRes.data.cars);
    }).finally(() => setIsLoading(false));
  }, []);

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-white/10 text-white/50',
    cancelled: 'bg-red-500/20 text-red-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  const handleApproveCar = async (carId: string, approved: boolean) => {
    await adminAPI.approveCar(carId, approved);
    setCars(prev => prev.map(c => c._id === carId ? { ...c, isApproved: approved } : c));
  };

  const handleUpdateUser = async (userId: string, isActive: boolean) => {
    await adminAPI.updateUser(userId, { isActive });
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive } : u));
  };

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-400" /> Admin Dashboard
            </h1>
            <p className="text-white/40 mt-1">Platform overview and management</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Total Cars', value: stats?.totalCars || 0, icon: Car, color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Active Now', value: stats?.activeBookings || 0, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Pending Cars', value: stats?.pendingCars || 0, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Revenue', value: `₹${((stats?.totalRevenue || 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'bookings', label: '📋 All Bookings' },
            { id: 'cars', label: '🚗 All Cars' },
            { id: 'users', label: '👥 All Users' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" /> Recent Bookings
              </h3>
              <div className="space-y-3">
                {bookings.slice(0, 5).map(booking => (
                  <div key={booking._id} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {(booking.car as any)?.brand} {(booking.car as any)?.model}
                      </p>
                      <p className="text-xs text-white/40">
                        by {(booking.user as any)?.name} · {format(new Date(booking.createdAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
                      <p className="text-xs text-primary-400 mt-1">₹{booking.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-white/40 text-sm text-center py-4">No bookings yet</p>}
              </div>
            </div>

            {/* Booked Cars Summary */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary-400" /> Cars Booking Status
              </h3>
              <div className="space-y-3">
                {cars.map(car => (
                  <div key={car._id} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-8 rounded-lg bg-dark-600 overflow-hidden shrink-0">
                        {car.images?.[0]?.url ?
                          <img src={car.images[0].url} alt="" className="w-full h-full object-cover" /> :
                          <div className="w-full h-full flex items-center justify-center text-lg">🚗</div>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{car.brand} {car.model}</p>
                        <p className="text-xs text-white/40">{car.location?.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${car.bookedDates?.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {car.bookedDates?.length > 0 ? `${car.bookedDates.length} booking(s)` : 'Available'}
                      </span>
                      <p className="text-xs text-white/40 mt-1">₹{car.pricePerDay?.toLocaleString()}/day</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-white">All Bookings ({bookings.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Car', 'User', 'Dates', 'Days', 'Amount', 'Status', 'Payment'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{(booking.car as any)?.brand} {(booking.car as any)?.model}</p>
                        <p className="text-xs text-white/40">{(booking.car as any)?.location?.city}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white">{(booking.user as any)?.name}</p>
                        <p className="text-xs text-white/40">{(booking.user as any)?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/60">
                        {format(new Date(booking.startDate), 'dd MMM')} → {format(new Date(booking.endDate), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{booking.totalDays}d</td>
                      <td className="px-4 py-3 text-sm font-medium text-primary-400">₹{booking.totalAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-white/40">No bookings found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cars Tab */}
        {activeTab === 'cars' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-white">All Cars ({cars.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Car', 'Owner', 'Price', 'Bookings', 'Status', 'Approved', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cars.map(car => (
                    <tr key={car._id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-8 rounded bg-dark-600 overflow-hidden shrink-0">
                            {car.images?.[0]?.url ?
                              <img src={car.images[0].url} alt="" className="w-full h-full object-cover" /> :
                              <span className="text-lg flex items-center justify-center h-full">🚗</span>
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{car.brand} {car.model}</p>
                            <p className="text-xs text-white/40">{car.location?.city} · {car.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{car.owner?.name}</td>
                      <td className="px-4 py-3 text-sm text-primary-400">₹{car.pricePerDay?.toLocaleString()}/day</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${car.bookedDates?.length > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                          {car.bookedDates?.length || 0} booking(s)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${car.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {car.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${car.isApproved ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {car.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {!car.isApproved && (
                            <button onClick={() => handleApproveCar(car._id, true)}
                              className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {car.isApproved && (
                            <button onClick={() => handleApproveCar(car._id, false)}
                              className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-white">All Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['User', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                          user.role === 'owner' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-white/10 text-white/50'
                        }`}>{user.role}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40">
                        {format(new Date(user.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {user.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleUpdateUser(user._id, !user.isActive)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            user.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}>
                          {user.isActive ? 'Ban' : 'Unban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── OWNER DASHBOARD ──────────────────────────────────────────────────────────
export function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Owner Dashboard</h1>
            <p className="text-white/40">Manage your car listings and bookings</p>
          </div>
          <Link to="/owner/add-car" className="btn-primary">+ Add New Car</Link>
        </div>
        <div className="card p-8 text-center">
          <span className="text-6xl mb-4 block">🚗</span>
          <h3 className="text-xl font-semibold text-white mb-2">Owner Dashboard</h3>
          <p className="text-white/40 mb-6">Manage your listings, track bookings and earnings.</p>
          <div className="grid sm:grid-cols-3 gap-4 mt-6 text-left">
            {['Add & manage car listings', 'Track bookings in real-time', 'View earnings & analytics'].map(feat => (
              <div key={feat} className="p-4 bg-dark-600 rounded-xl">
                <p className="text-sm text-white/70">✅ {feat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await updateProfile({ name, phone });
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white mb-8">Profile Settings</h1>
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">{user?.name}</h2>
              <p className="text-white/40 text-sm">{user?.email}</p>
              <span className="badge bg-primary-500/20 text-primary-400 mt-1 capitalize">{user?.role}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Email (read-only)</label>
              <input className="input opacity-50 cursor-not-allowed" value={user?.email} readOnly />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-6 text-center px-4">
      <span className="text-8xl">🛣️</span>
      <div>
        <h1 className="font-display text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-xl text-white/40 mb-6">Looks like you took a wrong turn</p>
      </div>
      <Link to="/" className="btn-primary px-8 py-4 text-base">Back to Home</Link>
    </div>
  );
}