import { motion } from 'framer-motion';
import { Car, Shield, Zap, Users, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16">
          <div className="w-20 h-20 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            About <span className="text-primary-500">DriveEasy</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            India's smartest car rental platform — connecting car owners with people who need to drive, powered by real-time technology and AI.
          </p>
        </motion.div>

        {/* Mission */}
        <div className="card p-8 mb-8">
          <h2 className="font-display text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-white/60 leading-relaxed">
            DriveEasy was built to solve the biggest problems in car rental — double bookings, lack of real-time availability, and poor user experience. We believe renting a car should be as simple as a few clicks, with instant confirmation and transparent pricing.
          </p>
          <p className="text-white/60 leading-relaxed mt-4">
            Our platform connects verified car owners with trusted renters across India, with real-time updates ensuring that when a car is booked, everyone knows instantly.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: '500+', label: 'Cars Available', icon: Car },
            { value: '10K+', label: 'Happy Customers', icon: Users },
            { value: '50+', label: 'Cities Covered', icon: MapPin },
            { value: '4.9', label: 'Average Rating', icon: Star },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="card p-5 text-center">
              <Icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-white/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Zap, title: 'Real-Time Updates', desc: 'Powered by Socket.io — when a car is booked, everyone knows instantly. No more double bookings.' },
            { icon: Shield, title: 'Verified & Safe', desc: 'All cars are verified and insured. All owners are screened. Your safety is our priority.' },
            { icon: Star, title: 'AI Powered', desc: 'Our AI assistant helps you find the perfect car by understanding your needs in plain English.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="card p-8 mb-8">
          <h2 className="font-display text-2xl font-bold text-white mb-6">Built With Modern Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'React.js', 'TypeScript', 'Node.js', 'Express.js',
              'MongoDB', 'Socket.io', 'OpenAI', 'Tailwind CSS',
              'Framer Motion', 'JWT Auth', 'Stripe', 'Cloudinary',
            ].map(tech => (
              <div key={tech} className="bg-dark-600 rounded-xl px-3 py-2 text-center">
                <span className="text-sm text-white/70 font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-4">Ready to Drive?</h2>
          <p className="text-white/50 mb-6">Join thousands of happy customers who trust DriveEasy</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/cars" className="btn-primary px-8 py-3">Browse Cars</Link>
            <Link to="/contact" className="btn-ghost px-8 py-3">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}