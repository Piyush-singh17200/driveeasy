import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Message sent! We will get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Contact <span className="text-primary-500">Us</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Have a question or need help? We're here 24/7 to assist you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-white text-lg mb-6">Get In Touch</h2>
              <div className="space-y-5">
                {[
                  { icon: Mail, title: 'Email Us', value: 'support@driveeasy.in', desc: 'We reply within 24 hours' },
                  { icon: Phone, title: 'Call Us', value: '+91 98765 43210', desc: 'Mon-Sat, 9AM to 6PM' },
                  { icon: MapPin, title: 'Our Office', value: 'Mumbai, Maharashtra', desc: 'India — 400001' },
                  { icon: Clock, title: 'Support Hours', value: '24/7 Online Support', desc: 'AI chat always available' },
                ].map(({ icon: Icon, title, value, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white/40">{title}</p>
                      <p className="font-medium text-white">{value}</p>
                      <p className="text-xs text-white/30">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-400" /> Quick Answers
              </h3>
              <div className="space-y-3">
                {[
                  'How do I book a car?',
                  'Can I cancel my booking?',
                  'How does payment work?',
                  'How do I list my car?',
                ].map(q => (
                  <div key={q} className="p-3 bg-dark-600 rounded-xl">
                    <p className="text-sm text-white/70">❓ {q}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card p-6">
            <h2 className="font-semibold text-white text-lg mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Your Name *</label>
                <input className="input" placeholder="Piyush Singh"
                  value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div>
                <label className="label">Subject</label>
                <input className="input" placeholder="How can we help?"
                  value={form.subject} onChange={e => update('subject', e.target.value)} />
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea className="input resize-none" rows={5}
                  placeholder="Describe your issue or question..."
                  value={form.message} onChange={e => update('message', e.target.value)} required />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="btn-primary w-full justify-center py-3.5">
                {isSubmitting ? (
                  <><span className="animate-spin">⏳</span> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}