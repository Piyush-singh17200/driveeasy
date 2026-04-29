import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2, QrCode, Copy, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentsAPI } from '../../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  bookingId: string;
  carName: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, bookingId, carName }: Props) {
  const [step, setStep] = useState<'qr' | 'verify' | 'success'>('qr');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const upiId = 'driveeasy@upi';
  const upiLink = `upi://pay?pa=${upiId}&pn=DriveEasy&am=${amount}&cu=INR&tn=Booking-${bookingId.slice(-6)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  useEffect(() => {
    if (!isOpen || step !== 'qr') return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied!');
  };

  const handleVerify = async () => {
    if (!utrNumber || utrNumber.length < 6) {
      toast.error('Please enter a valid UTR number');
      return;
    }
    setIsVerifying(true);
    try {
      await paymentsAPI.confirmUpi({ bookingId, utrNumber });
      setStep('success');
      setTimeout(() => { onSuccess(); }, 1200);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePaid = () => setStep('verify');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary-400" />
              <h2 className="font-semibold text-white">Pay via UPI</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {/* QR Step */}
          {step === 'qr' && (
            <div className="p-6">
              <div className="text-center mb-5">
                <p className="text-white/50 text-sm">{carName}</p>
                <p className="text-3xl font-bold text-primary-400 mt-1">₹{amount.toLocaleString()}</p>
                <p className="text-xs text-white/30 mt-1">Booking ID: #{bookingId.slice(-8).toUpperCase()}</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-white rounded-2xl">
                  <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48" />
                </div>
              </div>

              {/* UPI ID */}
              <div className="bg-dark-600 rounded-xl p-3 flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-white/40">UPI ID</p>
                  <p className="font-medium text-white">{upiId}</p>
                </div>
                <button onClick={copyUpiId}
                  className="p-2 bg-primary-500/20 rounded-lg hover:bg-primary-500/30 transition-colors">
                  <Copy className="w-4 h-4 text-primary-400" />
                </button>
              </div>

              {/* Timer */}
              <div className="text-center mb-4">
                <p className="text-xs text-white/40">QR expires in</p>
                <p className={`font-mono font-bold ${countdown < 60 ? 'text-red-400' : 'text-amber-400'}`}>
                  {formatTime(countdown)}
                </p>
              </div>

              {/* Apps */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  { name: 'GPay', emoji: '🟢' },
                  { name: 'PhonePe', emoji: '🟣' },
                  { name: 'Paytm', emoji: '🔵' },
                  { name: 'BHIM', emoji: '🟠' },
                ].map(app => (
                  <div key={app.name} className="text-center p-2 bg-dark-600 rounded-xl">
                    <span className="text-2xl">{app.emoji}</span>
                    <p className="text-xs text-white/50 mt-1">{app.name}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 btn-ghost py-3 justify-center text-sm">
                  Cancel
                </button>
                <button onClick={handlePaid} className="flex-1 btn-primary py-3 justify-center text-sm">
                  <Smartphone className="w-4 h-4" /> I've Paid
                </button>
              </div>
            </div>
          )}

          {/* Verify Step */}
          {step === 'verify' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Verify Payment</h3>
                <p className="text-white/50 text-sm">Enter the UTR number from your payment app to confirm</p>
              </div>

              <div className="mb-4">
                <label className="label">UTR / Transaction ID *</label>
                <input className="input" placeholder="12 digit UTR number"
                  value={utrNumber} onChange={e => setUtrNumber(e.target.value)}
                  maxLength={20} />
                <p className="text-xs text-white/30 mt-1">
                  Find this in your GPay/PhonePe/Paytm transaction history
                </p>
              </div>

              <div className="bg-dark-600 rounded-xl p-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Amount Paid</span>
                  <span className="font-bold text-emerald-400">₹{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-white/50">UPI ID</span>
                  <span className="text-white">{upiId}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('qr')} className="flex-1 btn-ghost py-3 justify-center text-sm">
                  Back
                </button>
                <button onClick={handleVerify} disabled={isVerifying}
                  className="flex-1 btn-primary py-3 justify-center text-sm">
                  {isVerifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Confirm Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="text-white/50 mb-2">Your booking is now confirmed</p>
              <p className="text-primary-400 font-bold text-xl">₹{amount.toLocaleString()}</p>
              <p className="text-xs text-white/30 mt-2">Redirecting to your booking...</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
