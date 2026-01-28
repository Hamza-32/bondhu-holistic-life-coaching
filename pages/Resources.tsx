import React, { useState } from 'react';
import { BookOpen, Video, FileText, Search, PlayCircle, ExternalLink } from 'lucide-react';

interface Resource {
    id: string;
    title: string;
    category: 'Mental Health' | 'Career' | 'Academic' | 'Lifestyle';
    type: 'article' | 'video';
    duration: string;
    image: string;
    author: string;
}

export const Resources = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const resources: Resource[] = [
        {
            id: '1',
            title: 'Managing Exam Anxiety: The 3-3-3 Rule',
            category: 'Academic',
            type: 'article',
            duration: '5 min read',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'Dr. Sarah Khan'
        },
        {
            id: '2',
            title: 'BCS Preparation Strategy for Beginners',
            category: 'Career',
            type: 'video',
            duration: '15 min watch',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'Career Coach Rahim'
        },
        {
            id: '3',
            title: 'How to Build a Resume that Stands Out',
            category: 'Career',
            type: 'article',
            duration: '8 min read',
            image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'HR Expert Nusrat'
        },
        {
            id: '4',
            title: 'Understanding Burnout vs. Stress',
            category: 'Mental Health',
            type: 'article',
            duration: '6 min read',
            image: 'https://images.unsplash.com/photo-1499209974431-2761e2523cc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'Bondhu Wellness Team'
        },
        {
            id: '5',
            title: '10 Minute Morning Yoga for Focus',
            category: 'Lifestyle',
            type: 'video',
            duration: '10 min watch',
            image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'Yoga with Aditi'
        },
        {
            id: '6',
            title: 'Effective Time Blocking Techniques',
            category: 'Academic',
            type: 'article',
            duration: '4 min read',
            image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            author: 'Productivity Hacker'
        },
    ];

    const categories = ['All', 'Mental Health', 'Career', 'Academic', 'Lifestyle'];

    const filteredResources = resources.filter(r => {
        const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Resource Library</h1>
                <p className="text-slate-600">Curated guides and videos to help you grow.</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bondhu-red/20"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                                    ? 'bg-bondhu-red text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                    <div key={resource.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={resource.image}
                                alt={resource.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-700 flex items-center gap-1">
                                {resource.type === 'video' ? <Video size={12} /> : <FileText size={12} />}
                                {resource.type === 'video' ? 'Video' : 'Article'}
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="text-xs font-semibold text-bondhu-red mb-2 uppercase tracking-wide">{resource.category}</div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-bondhu-red transition-colors">{resource.title}</h3>
                            <div className="flex items-center justify-between text-sm text-slate-500 mt-4">
                                <span>{resource.author}</span>
                                <span className="flex items-center gap-1">
                                    {resource.type === 'video' ? <PlayCircle size={14} /> : <BookOpen size={14} />}
                                    {resource.duration}
                                </span>
                            </div>
                            <button className="w-full mt-4 py-2 bg-slate-50 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group-hover:bg-bondhu-red group-hover:text-white">
                                View Resource <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-500">No resources found matching your criteria.</p>
                    <button
                        onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                        className="mt-2 text-bondhu-red font-medium hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
};
