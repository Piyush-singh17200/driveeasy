
import { carsAPI, bookingsAPI } from '../utils/api';
export function OwnerDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingsAPI.getOwnerBookings({ limit: 100 }),
      carsAPI.getOwnerCars(),
    ]).then(([bookRes, carRes]) => {
      setBookings(bookRes.data.bookings || []);
      setCars(carRes.data.cars || []);
    }).finally(() => setIsLoading(false));
  }, []);

  // Calculate monthly earnings
  const monthlyEarnings = bookings
    .filter(b => b.paymentStatus === 'paid' || b.status === 'completed' || b.status === 'confirmed')
    .reduce((acc: any, booking: any) => {
      const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + booking.totalAmount;
      return acc;
    }, {});

  const totalEarnings = Object.values(monthlyEarnings).reduce((a: any, b: any) => a + b, 0) as number;
  const thisMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
  const thisMonthEarnings = monthlyEarnings[thisMonth] || 0;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-white/10 text-white/50',
    cancelled: 'bg-red-500/20 text-red-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  if (isLoading) return (
    <div className="min-h-screen bg-dark-900 pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Owner Dashboard</h1>
            <p className="text-white/40">Welcome back, {user?.name?.split(' ')[0]}!</p>
          </div>
          <Link to="/cars" className="btn-primary text-sm">+ List New Car</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: `₹${(totalEarnings as number).toLocaleString()}`, icon: '💰', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'This Month', value: `₹${(thisMonthEarnings as number).toLocaleString()}`, icon: '📅', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Total Bookings', value: totalBookings, icon: '📋', color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { label: 'Active Now', value: activeBookings, icon: '🚗', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="card p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3 text-xl`}>{icon}</div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-white/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Monthly Earnings Table */}
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            💰 Monthly Earnings Breakdown
          </h3>
          {Object.keys(monthlyEarnings).length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No earnings yet — bookings will appear here once paid</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Month', 'Earnings', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(monthlyEarnings)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([month, amount]: [string, any]) => (
                      <tr key={month} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-4 py-3 text-sm font-medium text-white">{month}</td>
                        <td className="px-4 py-3 text-sm font-bold text-emerald-400">₹{amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${month === thisMonth ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/50'}`}>
                            {month === thisMonth ? 'Current Month' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  <tr className="border-t-2 border-primary-500/30">
                    <td className="px-4 py-3 text-sm font-bold text-white">Total</td>
                    <td className="px-4 py-3 text-base font-bold text-primary-400">₹{(totalEarnings as number).toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My Cars */}
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-white mb-4">🚗 My Car Listings ({cars.length})</h3>
          {cars.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No cars listed yet</p>
          ) : (
            <div className="space-y-3">
              {cars.map(car => (
                <div key={car._id} className="flex items-center gap-4 p-3 bg-dark-600 rounded-xl">
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                    {car.images?.[0]?.url ?
                      <img src={car.images[0].url} alt="" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-dark-500">🚗</div>
                    }
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{car.brand} {car.model}</p>
                    <p className="text-xs text-white/40">{car.location?.city} · ₹{car.pricePerDay?.toLocaleString()}/day</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${car.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {car.isAvailable ? 'Available' : 'Booked'}
                    </span>
                    <span className={`badge ${car.isApproved ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {car.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">📋 Recent Bookings ({bookings.length})</h3>
          {bookings.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Car', 'User', 'Dates', 'Amount', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 10).map(booking => (
                    <tr key={booking._id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{(booking.car as any)?.brand} {(booking.car as any)?.model}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white/60">{(booking.user as any)?.name}</p>
                        <p className="text-xs text-white/40">{(booking.user as any)?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/60">
                        {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-400">
                        ₹{booking.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}