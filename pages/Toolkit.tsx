import React, { useState } from 'react';
import { useBondhuStore } from '../store/useBondhuStore';
import { Smile, Meh, Frown, Check, Briefcase, FileText, ChevronRight } from 'lucide-react';
import { CareerQuiz } from '../components/CareerQuiz';
import { ResumeBuilder } from '../components/ResumeBuilder';

export const Toolkit = () => {
  const { logMood } = useBondhuStore();
  const [moodLogged, setMoodLogged] = useState(false);
  const [activeTool, setActiveTool] = useState<'mood' | 'quiz' | 'resume'>('mood');

  const handleMood = (mood: 'happy' | 'neutral' | 'stressed') => {
    logMood(mood);
    setMoodLogged(true);
    setTimeout(() => setMoodLogged(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Tool Navigation */}
      <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
        <button
          onClick={() => setActiveTool('mood')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTool === 'mood' ? 'bg-bondhu-red text-white shadow-lg shadow-red-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <Smile size={20} /> Mood Tracker
        </button>
        <button
          onClick={() => setActiveTool('quiz')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTool === 'quiz' ? 'bg-bondhu-red text-white shadow-lg shadow-red-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <Briefcase size={20} /> Career Quiz
        </button>
        <button
          onClick={() => setActiveTool('resume')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTool === 'resume' ? 'bg-bondhu-red text-white shadow-lg shadow-red-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <FileText size={20} /> Resume Builder
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTool === 'mood' && (
          <section className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">How are you feeling today?</h2>
            <p className="text-slate-500 mb-10 text-lg">Tracking your emotions is the first step to mastering them.</p>

            {moodLogged ? (
              <div className="py-8 text-green-600 flex flex-col items-center animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <p className="text-2xl font-bold">Logged! Thanks for checking in.</p>
                <button onClick={() => setMoodLogged(false)} className="mt-6 text-slate-500 underline hover:text-bondhu-red">Log another emotion</button>
              </div>
            ) : (
              <div className="flex justify-center gap-8 flex-wrap">
                <button onClick={() => handleMood('happy')} className="flex flex-col items-center gap-4 group">
                  <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer border-2 border-transparent group-hover:border-green-200 shadow-sm">
                    <Smile className="w-12 h-12 text-green-500" />
                  </div>
                  <span className="font-bold text-lg text-slate-700">Great</span>
                </button>
                <button onClick={() => handleMood('neutral')} className="flex flex-col items-center gap-4 group">
                  <div className="w-24 h-24 bg-yellow-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer border-2 border-transparent group-hover:border-yellow-200 shadow-sm">
                    <Meh className="w-12 h-12 text-yellow-500" />
                  </div>
                  <span className="font-bold text-lg text-slate-700">Okay</span>
                </button>
                <button onClick={() => handleMood('stressed')} className="flex flex-col items-center gap-4 group">
                  <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer border-2 border-transparent group-hover:border-red-200 shadow-sm">
                    <Frown className="w-12 h-12 text-red-500" />
                  </div>
                  <span className="font-bold text-lg text-slate-700">Stressed</span>
                </button>
              </div>
            )}
          </section>
        )}

        {activeTool === 'quiz' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Career Compass 🧭</h2>
              <p className="text-slate-500">Discover a path that fits your personality.</p>
            </div>
            <CareerQuiz />
          </div>
        )}

        {activeTool === 'resume' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Resume Builder 📄</h2>
              <p className="text-slate-500">Create a clean, professional CV in minutes.</p>
            </div>
            <ResumeBuilder />
          </div>
        )}
      </div>
    </div>
  );
};
