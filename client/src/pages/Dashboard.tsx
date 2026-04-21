import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Car, Calendar, Star, User, LayoutDashboard, TrendingUp } from 'lucide-react';

export function Dashboard() {
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
          <Link to="/profile" className="card-hover p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Profile Settings</h3>
              <p className="text-sm text-white/40">Update your information</p>
            </div>
          </Link>
          {user?.role === 'owner' && (
            <Link to="/owner" className="card-hover p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Owner Dashboard</h3>
                <p className="text-sm text-white/40">Manage your listings</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

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
          <p className="text-white/40 mb-6">
            Full owner features: add/edit/delete cars, view bookings, manage pricing, and track earnings.
            Connect your backend to see your live listings.
          </p>
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

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/40">Platform overview and management tools</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', icon: '👥', color: 'from-blue-500/20 to-blue-600/10' },
            { label: 'Total Cars', icon: '🚗', color: 'from-primary-500/20 to-primary-600/10' },
            { label: 'Bookings', icon: '📋', color: 'from-green-500/20 to-green-600/10' },
            { label: 'Revenue', icon: '💰', color: 'from-amber-500/20 to-amber-600/10' },
          ].map(({ label, icon, color }) => (
            <div key={label} className={`card p-5 bg-gradient-to-br ${color}`}>
              <span className="text-3xl mb-2 block">{icon}</span>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-sm text-white/50">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Pending Approvals', desc: 'Review new car listings', icon: '🔍', badge: 0 },
            { title: 'User Management', desc: 'Manage accounts & roles', icon: '👤', badge: null },
            { title: 'All Bookings', desc: 'Monitor platform bookings', icon: '📊', badge: null },
          ].map(({ title, desc, icon, badge }) => (
            <div key={title} className="card-hover p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{icon}</span>
                {badge !== null && badge > 0 && (
                  <span className="badge bg-primary-500/20 text-primary-400">{badge} pending</span>
                )}
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-white/40">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState_profile(user);

  function useState_profile(u: any) {
    const [f, sf] = require('react').useState({ name: u?.name || '', phone: u?.phone || '', email: u?.email || '' });
    return [f, sf] as [typeof f, typeof sf];
  }

  const [name, setName] = require('react').useState(user?.name || '');
  const [phone, setPhone] = require('react').useState(user?.phone || '');

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

export default Dashboard;
