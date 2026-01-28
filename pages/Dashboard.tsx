import React from 'react';
import { useBondhuStore } from '../store/useBondhuStore';
import { motion } from 'framer-motion';
import { Trophy, Calendar, CheckSquare, Brain, Target, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, sessions, quests, completeQuest } = useBondhuStore();

  const progressPercent = (user.xp % 500) / 500 * 100;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-bondhu-red to-orange-500 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shuvo Shokal, {user.name}! ☀️</h1>
            <p className="text-red-100">You are on a <span className="font-bold bg-white/20 px-2 py-0.5 rounded">{user.streak}-day streak</span>. Keep it up!</p>
          </div>
          <div className="text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[200px]">
            <div className="text-xs uppercase tracking-wider text-red-100 mb-1">Current Level</div>
            <div className="text-4xl font-extrabold flex items-center justify-end gap-2">
              {user.level}
              <Trophy className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
            <div className="w-full bg-black/20 h-2 rounded-full mt-2 overflow-hidden">
               <div className="bg-white h-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="text-xs text-right mt-1 text-red-100">{user.xp % 500} / 500 XP</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-3 mb-2">
                 <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Brain size={20} /></div>
                 <h3 className="font-semibold text-slate-700">Mood Score</h3>
               </div>
               <div className="text-3xl font-bold text-slate-800">{user.moodScore}/100</div>
               <p className="text-sm text-green-500 mt-1 flex items-center gap-1"><ArrowUpRight size={14}/> +5 this week</p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-3 mb-2">
                 <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Target size={20} /></div>
                 <h3 className="font-semibold text-slate-700">Coins</h3>
               </div>
               <div className="text-3xl font-bold text-slate-800">{user.coins}</div>
               <p className="text-sm text-slate-400 mt-1">Spend on premiums</p>
             </div>
          </div>

          {/* Daily Quests */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckSquare className="text-bondhu-red"/> Daily Quests
            </h2>
            <div className="space-y-3">
              {quests.map((quest) => (
                <div key={quest.id} className={`flex items-center justify-between p-4 rounded-lg border ${quest.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => completeQuest(quest.id)}
                      disabled={quest.completed}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${quest.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-bondhu-red'}`}
                    >
                      {quest.completed && <CheckSquare size={14} />}
                    </button>
                    <span className={quest.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>{quest.title}</span>
                  </div>
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">+{quest.xpReward} XP</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
           {/* Upcoming Session */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="text-bondhu-red"/> Upcoming
              </h2>
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map(session => (
                    <div key={session.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-bondhu-red">
                      <p className="font-bold text-slate-900">{session.coachName}</p>
                      <p className="text-sm text-slate-500 mb-2">{session.date}</p>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">Video Call</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm mb-4">No sessions booked.</p>
                  <Link to="/coaching" className="text-bondhu-red font-medium hover:underline text-sm">Find a coach &rarr;</Link>
                </div>
              )}
           </div>
           
           {/* Quick Actions */}
           <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
             <h3 className="font-bold mb-4">Quick Actions</h3>
             <div className="space-y-3">
                <Link to="/toolkit" className="block w-full text-center bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors">Log Mood</Link>
                <Link to="/arcade" className="block w-full text-center bg-bondhu-red hover:bg-red-600 py-2 rounded-lg transition-colors font-semibold">Stress Relief</Link>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
