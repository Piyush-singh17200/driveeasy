import toast from 'react-hot-toast';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Car, Mail, Loader2, KeyRound, Lock } from 'lucide-react';
import { authAPI } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      toast.success(res.data.message || 'If the email is registered, an OTP has been sent.');
      setOtpStep(true);
      if (res.data.developmentOtp) {
        setTimeout(() => toast(`🧪 Demo Mode: Your Reset OTP is ${res.data.developmentOtp}`, { duration: 10000, icon: '🔑' }), 1000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setIsLoading(true);
    try {
      await authAPI.resetPassword(otp, { password: newPassword });
      toast.success('Password reset successfully! You can now sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="font-display text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-white/40">Securely recover your account access</p>
        </div>

        <div className="card p-8">
          {!otpStep ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="email" className="input pl-10" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : 'Send Reset Code'}
              </button>
              <Link to="/login" className="block text-center text-sm text-white/40 hover:text-white mt-4 transition-colors">
                Back to Sign In
              </Link>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="label">Enter 6-Digit Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="text" className="input pl-10 tracking-widest font-mono text-center" placeholder="123456" maxLength={6}
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus />
                </div>
                <p className="text-xs text-white/40 mt-2 text-center">Code sent to {email}</p>
              </div>
              
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type={showPassword ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="Min. 6 characters"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type={showPassword ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="Confirm password"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} required />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 mt-2">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setOtpStep(false)} className="w-full text-center text-sm text-white/40 hover:text-white mt-4 transition-colors">
                Use a different email
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
