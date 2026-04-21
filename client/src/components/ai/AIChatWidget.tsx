import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { aiAPI } from '../../utils/api';
import { ChatMessage, Car } from '../../types';
import CarCard from '../cars/CarCard';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm your DriveEasy AI assistant 🚗 Tell me what you're looking for — budget, trip type, or city — and I'll find the perfect car for you!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await aiAPI.chat({
        message: userMessage,
        conversationHistory: history,
      });
      const { reply, recommendedCars: cars, updatedHistory } = res.data;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setHistory(updatedHistory);
      if (cars?.length > 0) setRecommendedCars(cars);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'SUV under ₹2000/day in Mumbai',
    'Best car for family trip',
    'Electric cars available',
    'Luxury sedan for wedding',
  ];

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-500 rounded-2xl shadow-glow-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-dark-900" />
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-dark-800 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-dark-700">
              <div className="w-9 h-9 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">AI Car Assistant</h3>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Online
                </p>
              </div>
              <span className="ml-auto text-xs text-white/30 bg-white/5 px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent" /> GPT-4o
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant' ? 'bg-primary-500/20' : 'bg-white/10'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-primary-400" /> : <User className="w-4 h-4 text-white/60" />}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-dark-600 text-white/90 rounded-tl-none'
                      : 'bg-primary-500/20 text-white rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="bg-dark-600 px-4 py-3 rounded-xl rounded-tl-none flex gap-1">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-primary-400 rounded-full"
                        animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, delay: d, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Cars */}
              {recommendedCars.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-white/40 mb-2 font-medium">Recommended for you:</p>
                  <div className="space-y-2">
                    {recommendedCars.slice(0, 2).map(car => (
                      <a key={car._id} href={`/cars/${car._id}`}
                        className="flex items-center gap-3 p-2 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors">
                        <div className="w-12 h-10 rounded-lg bg-dark-500 overflow-hidden shrink-0">
                          {car.images?.[0]?.url ? (
                            <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : <span className="w-full h-full flex items-center justify-center text-xl">🚗</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{car.brand} {car.model}</p>
                          <p className="text-xs text-primary-400">₹{car.pricePerDay.toLocaleString()}/day</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {quickPrompts.map(p => (
                  <button key={p} onClick={() => { setInput(p); }}
                    className="shrink-0 text-xs px-3 py-1.5 bg-white/5 hover:bg-primary-500/20 rounded-full text-white/60 hover:text-primary-400 transition-colors border border-white/5 hover:border-primary-500/30">
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  className="input text-sm py-2.5 flex-1"
                  disabled={isLoading}
                />
                <button onClick={sendMessage} disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-xl transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
