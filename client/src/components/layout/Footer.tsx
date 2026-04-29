import { Link } from 'react-router-dom';
import { Car, Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">Drive<span className="text-primary-500">Easy</span></span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Smart car rental platform with real-time availability and AI-powered recommendations.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-white/5 hover:bg-primary-500/20 text-white/40 hover:text-primary-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Browse', links: [['All Cars', '/cars'], ['SUVs', '/cars?category=SUV'], ['Sedans', '/cars?category=Sedan'], ['Electric', '/cars?category=Electric']] },
            { title: 'Platform', links: [['For Owners', '/register?role=owner'], ['Dashboard', '/dashboard'], ['Bookings', '/bookings'], ['AI Assistant', '/cars']] },
            { title: 'Support', links: [['Help Center', '/contact'], ['Contact Us', '/contact'], ['Privacy Policy', '/about'], ['Terms of Service', '/about']] },
          ].map(section => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-white/60 hover:text-primary-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} DriveEasy. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Mail className="w-3 h-3" />
            <span>support@driveeasy.in</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
