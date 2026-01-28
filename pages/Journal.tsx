import React, { useState } from 'react';
import { useBondhuStore } from '../store/useBondhuStore';
import { Book, PenTool, Smile, Frown, Meh, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Journal = () => {
    const { journalEntries, addJournalEntry } = useBondhuStore();
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState('neutral');

    const moods = [
        { id: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500', bg: 'bg-green-50' },
        { id: 'neutral', icon: Meh, label: 'Neutral', color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { id: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        addJournalEntry(content, selectedMood);
        setContent('');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                    <Book className="text-bondhu-red" />
                    Daily Journal
                </h1>
                <p className="text-slate-600 mt-2">A safe space for your thoughts, gratitude, and reflections.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Compose Area */}
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <PenTool size={20} className="text-slate-400" />
                            Write Entry
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="How are you feeling today? What's on your mind?"
                                className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bondhu-red/20 resize-none font-serif text-lg leading-relaxed text-slate-700 placeholder:text-slate-300"
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    {moods.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setSelectedMood(m.id)}
                                            className={`p-2 rounded-lg transition-all ${selectedMood === m.id ? `${m.bg} ring-2 ring-offset-2 ring-${m.color.split('-')[1]}-200` : 'hover:bg-slate-50'}`}
                                            title={m.label}
                                        >
                                            <m.icon className={`w-6 h-6 ${selectedMood === m.id ? m.color : 'text-slate-400'}`} />
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    disabled={!content.trim()}
                                    className="bg-bondhu-red text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* History / Recent */}
                <div className="md:col-span-1">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-slate-400" />
                        Recent Entries
                    </h2>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {journalEntries.length === 0 ? (
                                <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm">No entries yet. Start writing!</p>
                                </div>
                            ) : (
                                journalEntries.slice(0, 5).map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 group hover:border-bondhu-red/20 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </span>
                                            {moods.find(m => m.id === entry.mood)?.icon && React.createElement(moods.find(m => m.id === entry.mood)!.icon, { size: 16, className: 'text-slate-400' })}
                                        </div>
                                        <p className="text-slate-700 text-sm line-clamp-3 font-serif">
                                            {entry.content}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
