import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BarChart3, Calendar, Car, CheckCircle, Clock, IndianRupee,
  Loader2, Shield, User as UserIcon, Users, XCircle, Lock
} from 'lucide-react';
import { adminAPI, bookingsAPI, carsAPI, authAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-white/10 text-white/50',
  cancelled: 'bg-red-500/20 text-red-400',
  rejected: 'bg-red-500/20 text-red-400',
};

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="card p-5">
      <Icon className="w-6 h-6 text-primary-400 mb-3" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/40">{label}</p>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getBookings({ limit: 5 })
      .then(res => setBookings(res.data.bookings || []))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/40">Welcome back, {user?.name?.split(' ')[0]}.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Bookings" value={bookings.length} icon={Calendar} />
          <StatCard label="Active" value={bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length} icon={Clock} />
          <StatCard label="Paid" value={bookings.filter(b => b.paymentStatus === 'paid').length} icon={IndianRupee} />
          <StatCard label="Account Role" value={user?.role || 'user'} icon={UserIcon} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Bookings</h2>
            <Link to="/bookings" className="text-sm text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/40 mb-4">No bookings yet.</p>
              <Link to="/cars" className="btn-primary inline-flex">Browse Cars</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => {
                const car = booking.car || {};
                return (
                  <Link key={booking._id} to={`/bookings/${booking._id}`} className="flex items-center gap-4 p-3 bg-dark-600 rounded-xl hover:bg-dark-500 transition-colors">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-dark-500">
                      {car.images?.[0]?.url && <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{car.brand} {car.model}</p>
                      <p className="text-xs text-white/40">{new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OwnerDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: new Date().getFullYear().toString(),
    category: 'SUV', transmission: 'Automatic', fuel: 'Petrol', seats: '5',
    pricePerDay: '', city: 'Mumbai', state: 'Maharashtra', imageUrl: '', description: '',
  });

  const loadOwnerData = () => {
    setIsLoading(true);
    Promise.all([
      bookingsAPI.getOwnerBookings({ limit: 100 }),
      carsAPI.getOwnerCars(),
    ]).then(([bookRes, carRes]) => {
      setBookings(bookRes.data.bookings || []);
      setCars(carRes.data.cars || []);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { loadOwnerData(); }, []);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const addCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = new FormData();
      Object.entries({
        name: form.name,
        brand: form.brand,
        model: form.model,
        year: form.year,
        category: form.category,
        transmission: form.transmission,
        fuel: form.fuel,
        seats: form.seats,
        pricePerDay: form.pricePerDay,
        description: form.description,
        'location[city]': form.city,
        'location[state]': form.state,
      }).forEach(([key, value]) => data.append(key, value));
      if (form.imageUrl) data.append('images', JSON.stringify([{ url: form.imageUrl, isPrimary: true }]));
      await carsAPI.createCar(data);
      toast.success('Car added successfully! Waiting for admin approval.');
      setForm(f => ({ ...f, name: '', brand: '', model: '', pricePerDay: '', imageUrl: '', description: '' }));
      loadOwnerData();
    } finally {
      setIsSaving(false);
    }
  };

  const totalEarnings = bookings
    .filter(b => b.paymentStatus === 'paid' || b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

  // Generate chart data
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { name: d.toLocaleString('default', { month: 'short' }), total: 0, date: d };
  }).reverse();

  bookings.filter(b => b.paymentStatus === 'paid' || b.status === 'completed' || b.status === 'confirmed').forEach(b => {
    const d = new Date(b.createdAt);
    const month = last6Months.find(m => m.date.getMonth() === d.getMonth() && m.date.getFullYear() === d.getFullYear());
    if (month) month.total += b.totalAmount || 0;
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Owner Dashboard</h1>
            <p className="text-white/40">Welcome back, {user?.name?.split(' ')[0]}.</p>
          </div>
          <Link to="/cars" className="btn-primary text-sm">Browse Cars</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon={IndianRupee} />
          <StatCard label="My Cars" value={cars.length} icon={Car} />
          <StatCard label="Bookings" value={bookings.length} icon={Calendar} />
          <StatCard label="Active Now" value={bookings.filter(b => ['active', 'confirmed'].includes(b.status)).length} icon={Clock} />
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          <motion.form onSubmit={addCar} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 xl:col-span-1 space-y-3">
            <h2 className="font-semibold text-white mb-2">List a New Car</h2>
            {[
              ['name', 'Car Name'], ['brand', 'Brand'], ['model', 'Model'], ['pricePerDay', 'Price / Day'],
              ['imageUrl', 'Image URL'],
            ].map(([key, label]) => (
              <input key={key} className="input" placeholder={label} value={(form as any)[key]} onChange={e => update(key, e.target.value)} required={key !== 'imageUrl'} />
            ))}
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Year" value={form.year} onChange={e => update('year', e.target.value)} />
              <input className="input" placeholder="Seats" value={form.seats} onChange={e => update('seats', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} required />
              <input className="input" placeholder="State" value={form.state} onChange={e => update('state', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
                {['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Van'].map(v => <option key={v} className="bg-dark-600">{v}</option>)}
              </select>
              <select className="input" value={form.fuel} onChange={e => update('fuel', e.target.value)}>
                {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map(v => <option key={v} className="bg-dark-600">{v}</option>)}
              </select>
              <select className="input" value={form.transmission} onChange={e => update('transmission', e.target.value)}>
                {['Manual', 'Automatic', 'CVT'].map(v => <option key={v} className="bg-dark-600">{v}</option>)}
              </select>
            </div>
            <textarea className="input resize-none" rows={3} placeholder="Description" value={form.description} onChange={e => update('description', e.target.value)} />
            <button disabled={isSaving} className="btn-primary w-full justify-center">
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : 'List Car'}
            </button>
          </motion.form>

          <div className="xl:col-span-2 space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Earnings Overview</h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last6Months}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#ffffff50" />
                    <YAxis stroke="#ffffff50" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="total" stroke="#e94560" strokeWidth={3} dot={{ fill: '#e94560' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">My Cars</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {cars.map(car => <CarRow key={car._id} car={car} />)}
                {cars.length === 0 && <p className="text-white/40 text-sm text-center py-8">No cars listed yet.</p>}
              </div>
            </div>
            <BookingTable bookings={bookings.slice(0, 8)} title="Recent Bookings" showCustomer={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CarRow({ car, onApprove }: { car: any; onApprove?: (id: string, approved: boolean) => void }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-dark-600 rounded-xl">
      <div className="w-16 h-12 rounded-lg overflow-hidden bg-dark-500 shrink-0">
        {car.images?.[0]?.url && <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm truncate">{car.brand} {car.model}</p>
        <p className="text-xs text-white/40">{car.location?.city} · ₹{car.pricePerDay?.toLocaleString()}/day</p>
      </div>
      <span className={`badge ${car.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {car.isAvailable ? 'Available' : 'Booked'}
      </span>
      {onApprove && (
        <button onClick={() => onApprove(car._id, !car.isApproved)} className="btn-ghost py-2 px-3 text-xs">
          {car.isApproved ? 'Unapprove' : 'Approve'}
        </button>
      )}
    </div>
  );
}

function BookingTable({ bookings, title, showCustomer }: { bookings: any[]; title: string; showCustomer?: boolean }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Car', ...(showCustomer ? ['Customer'] : []), 'Amount', 'Payment', 'Status'].map(h => <th key={h} className="text-left px-3 py-3 text-xs font-medium text-white/40 uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => window.location.href = `/bookings/${booking._id}`}>
                <td className="px-3 py-3 text-sm text-white">{booking.car?.brand} {booking.car?.model}</td>
                {showCustomer && (
                  <td className="px-3 py-3 text-sm text-white/80">
                    <div className="font-medium">{booking.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-white/40">{booking.user?.email}</div>
                  </td>
                )}
                <td className="px-3 py-3 text-sm text-primary-400">₹{booking.totalAmount?.toLocaleString()}</td>
                <td className="px-3 py-3 text-sm text-white/60 capitalize">{booking.paymentStatus || 'Pending'}</td>
                <td className="px-3 py-3"><span className={`badge ${STATUS_STYLES[booking.status]}`}>{booking.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="text-white/40 text-sm text-center py-8">No bookings found.</p>}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: new Date().getFullYear().toString(),
    category: 'SUV', transmission: 'Automatic', fuel: 'Petrol', seats: '5',
    pricePerDay: '', city: '', state: '', imageUrl: '', description: '',
  });

  const loadAdmin = () => {
    setIsLoading(true);
    Promise.all([
      adminAPI.getDashboard(),
      adminAPI.getCars({ limit: 100 }),
      adminAPI.getBookings({ limit: 10 }),
    ]).then(([dashboardRes, carsRes, bookingsRes]) => {
      setStats(dashboardRes.data.stats);
      setCars(carsRes.data.cars || []);
      setBookings(bookingsRes.data.bookings || []);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { loadAdmin(); }, []);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const addCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = new FormData();
      Object.entries({
        name: form.name,
        brand: form.brand,
        model: form.model,
        year: form.year,
        category: form.category,
        transmission: form.transmission,
        fuel: form.fuel,
        seats: form.seats,
        pricePerDay: form.pricePerDay,
        description: form.description,
        'location[city]': form.city,
        'location[state]': form.state,
      }).forEach(([key, value]) => data.append(key, value));
      if (form.imageUrl) data.append('images', JSON.stringify([{ url: form.imageUrl, isPrimary: true }]));
      await carsAPI.createCar(data);
      toast.success('Car added. Approve it from the list if needed.');
      setForm(f => ({ ...f, name: '', brand: '', model: '', pricePerDay: '', city: '', state: '', imageUrl: '', description: '' }));
      loadAdmin();
    } finally {
      setIsSaving(false);
    }
  };

  const approveCar = async (id: string, approved: boolean) => {
    await adminAPI.approveCar(id, approved);
    setCars(prev => prev.map(car => car._id === id ? { ...car, isApproved: approved } : car));
    toast.success(approved ? 'Car approved' : 'Car unapproved');
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary-400" />
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/40">Manage cars, users, bookings, and approvals.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard label="Users" value={stats?.totalUsers || 0} icon={Users} />
          <StatCard label="Cars" value={stats?.totalCars || 0} icon={Car} />
          <StatCard label="Bookings" value={stats?.totalBookings || 0} icon={Calendar} />
          <StatCard label="Active" value={stats?.activeBookings || 0} icon={Clock} />
          <StatCard label="Pending Cars" value={stats?.pendingCars || 0} icon={XCircle} />
          <StatCard label="Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={BarChart3} />
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          <motion.form onSubmit={addCar} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 xl:col-span-1 space-y-3">
            <h2 className="font-semibold text-white mb-2">Add New Car</h2>
            {[
              ['name', 'Car Name'], ['brand', 'Brand'], ['model', 'Model'], ['pricePerDay', 'Price / Day'],
              ['city', 'City'], ['state', 'State'], ['imageUrl', 'Image URL'],
            ].map(([key, label]) => (
              <input key={key} className="input" placeholder={label} value={(form as any)[key]} onChange={e => update(key, e.target.value)} required={key !== 'imageUrl'} />
            ))}
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Year" value={form.year} onChange={e => update('year', e.target.value)} />
              <input className="input" placeholder="Seats" value={form.seats} onChange={e => update('seats', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
                {['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Van'].map(v => <option key={v} className="bg-dark-600">{v}</option>)}
              </select>
              <select className="input" value={form.fuel} onChange={e => update('fuel', e.target.value)}>
                {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map(v => <option key={v} className="bg-dark-600">{v}</option>)}
              </select>
              <select className="input" value={form.transmission} onChange={e => update('transmission', e.target.value)}>
                {['Manual', 'Automatic', 'CVT'].map(v => <option key={v} className="bg-dark-600">{v}</option>)}
              </select>
            </div>
            <textarea className="input resize-none" rows={3} placeholder="Description" value={form.description} onChange={e => update('description', e.target.value)} />
            <button disabled={isSaving} className="btn-primary w-full justify-center">
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Add Car'}
            </button>
          </motion.form>

          <div className="xl:col-span-2 space-y-6">
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-4">Cars & Approvals</h2>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {cars.map(car => <CarRow key={car._id} car={car} onApprove={approveCar} />)}
              </div>
            </div>
            <BookingTable bookings={bookings} title="Latest Bookings" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isPwdSaving, setIsPwdSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error('Phone must be exactly 10 digits starting with 6, 7, 8, or 9');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile(form);
    } finally {
      setIsSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsPwdSaving(true);
    try {
      await authAPI.changePassword({ 
        currentPassword: pwdForm.currentPassword, 
        newPassword: pwdForm.newPassword 
      });
      toast.success('Password updated successfully');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } finally {
      setIsPwdSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16 space-y-8">
      <form onSubmit={save} className="max-w-xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white mb-6">Profile Settings</h1>
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} maxLength={10} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
          </div>
          <button disabled={isSaving} className="btn-primary w-full justify-center">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} className="max-w-xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-white mb-6">Change Password</h2>
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" required className="input" value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" required className="input" minLength={6} value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" required className="input" minLength={6} value={pwdForm.confirmPassword} onChange={e => setPwdForm(f => ({ ...f, confirmPassword: e.target.value }))} />
          </div>
          <button disabled={isPwdSaving} className="btn-primary w-full justify-center bg-dark-600 hover:bg-dark-500 text-white border border-white/10">
            {isPwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 pt-24 flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="font-display text-5xl font-bold text-white">404</h1>
      <p className="text-white/50">This page does not exist.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
