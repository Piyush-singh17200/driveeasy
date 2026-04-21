import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Car, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center"><Car className="w-5 h-5 text-white" /></div>
            <span className="font-display text-2xl font-bold text-white">Drive<span className="text-primary-500">Easy</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/40">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="email" className="input pl-10" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</Link>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Create one</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
            <p className="text-xs text-white/40 mb-1 font-medium">Demo Credentials:</p>
            <p className="text-xs text-white/60">User: user@demo.com / Demo1234</p>
            <p className="text-xs text-white/60">Admin: admin@demo.com / Admin1234</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'user';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole, phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center"><Car className="w-5 h-5 text-white" /></div>
            <span className="font-display text-2xl font-bold text-white">Drive<span className="text-primary-500">Easy</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-white/40">Start renting in minutes</p>
        </div>

        <div className="card p-8">
          {/* Role Toggle */}
          <div className="flex gap-2 p-1 bg-dark-600 rounded-xl mb-6">
            {[['user', '🧑 I want to rent'], ['owner', '🚗 I own cars']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => update('role', val)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  form.role === val ? 'bg-primary-500 text-white shadow-lg' : 'text-white/50 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type={type} className="input" placeholder={placeholder}
                  value={form[key as keyof typeof form]} onChange={e => update(key, e.target.value)}
                  required={key !== 'phone'} />
              </div>
            ))}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input pr-10" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => update('password', e.target.value)} minLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-white/30 text-center mt-4">
            By signing up, you agree to our Terms of Service & Privacy Policy
          </p>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
