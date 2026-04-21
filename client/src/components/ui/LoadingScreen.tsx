// components/ui/LoadingScreen.tsx
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500 rounded-full"
      />
    </div>
  );
}
