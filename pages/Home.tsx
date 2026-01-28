import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, ShieldCheck, Heart, Star, Quote } from 'lucide-react';

export const Home = () => {
  /* Quotes Data */
  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    // Rotate quotes every 8 seconds
    const interval = setInterval(() => {
      setCurrentQuote(prev => {
        const currentIndex = quotes.indexOf(prev);
        const nextIndex = (currentIndex + 1) % quotes.length;
        return quotes[nextIndex];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white to-red-50 rounded-3xl overflow-hidden shadow-xl border border-slate-100 p-8 md:p-16 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-red-100 text-bondhu-red font-semibold px-4 py-1.5 rounded-full text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              🇧🇩 #1 Life Coaching Platform in Bangladesh
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              Grow Stronger, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bondhu-red to-orange-600">Together.</span>
            </h1>
            <p className="text-lg text-slate-600 mt-4 max-w-lg leading-relaxed">
              Feeling stuck with career choices, academic pressure, or just life in Dhaka? Bondhu connects you with mentors, tools, and a community that understands your journey.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/dashboard" className="bg-bondhu-red hover:bg-bondhu-dark text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-200 hover:shadow-xl">
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/community" className="bg-white border-2 border-slate-200 text-slate-700 hover:border-bondhu-red hover:text-bondhu-red px-8 py-4 rounded-xl font-bold transition-all hover:bg-red-50">
              Join the Adda
            </Link>
          </motion.div>
        </div>

        <div className="flex-1 relative w-full flex justify-center">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-red-100/50 to-orange-100/50 rounded-full blur-3xl -z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Students collaborating"
            className="relative z-10 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 w-full max-w-md object-cover aspect-square"
          />
          {/* Floating Badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 -left-4 bg-white p-4 rounded-xl shadow-lg border border-slate-50 flex items-center gap-3 z-20"
          >
            <div className="bg-yellow-100 p-2 rounded-full">
              <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Top Rated</p>
              <p className="text-xs text-slate-500">By 500+ Students</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center group hover:border-bondhu-red/30 transition-all duration-300">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-8 h-8 text-bondhu-red" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Mentors</h3>
          <p className="text-slate-500 leading-relaxed">Connect with career experts and psychologists who understand the Bangladeshi context—from BCS prep to corporate burnout.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center group hover:border-blue-200 transition-all duration-300">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Heart className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Holistic Wellness</h3>
          <p className="text-slate-500 leading-relaxed">Mental health is not a weakness. Track your mood daily and use our breathing tools to calm anxiety before exams.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center group hover:border-green-200 transition-all duration-300">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Gamified Habits</h3>
          <p className="text-slate-500 leading-relaxed">Build discipline one day at a time. Complete daily quests, earn XP, and keep your streak alive.</p>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-slate-900 rounded-2xl p-12 text-center text-white relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <Quote className="w-12 h-12 text-bondhu-red mb-6 mx-auto opacity-80" />
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentQuote.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-serif italic mb-6 leading-relaxed">
                "{currentQuote.text}"
              </h2>
              <div className="w-16 h-1 bg-bondhu-red mx-auto mb-4 rounded-full"></div>
              <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">{currentQuote.author}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};