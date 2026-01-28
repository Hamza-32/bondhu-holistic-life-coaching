import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBondhuStore } from '../store/useBondhuStore';
import { ArrowRight } from 'lucide-react';

export const Onboarding = () => {
  const { user, setUserName } = useBondhuStore();
  const [inputName, setInputName] = useState('');

  // If user has a name, don't show this
  if (user.name) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
      >
        <div className="w-16 h-16 bg-bondhu-red text-white rounded-xl flex items-center justify-center text-3xl font-bold mx-auto mb-6">
          B
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Bondhu</h2>
        <p className="text-slate-500 mb-8">Your partner in personal growth. Let's start with your name.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium text-slate-700 mb-1">What should we call you?</label>
            <input 
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="e.g. Rahim"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-bondhu-red/20 focus:border-bondhu-red outline-none transition-all"
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            disabled={!inputName.trim()}
            className="w-full bg-bondhu-red text-white py-3 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Let's Start <ArrowRight size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};