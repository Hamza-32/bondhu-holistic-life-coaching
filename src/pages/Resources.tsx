import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Managing Exam Anxiety: The 3-3-3 Rule',
      category: 'Academic',
      type: 'article',
      duration: '5 min read',
      image:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Dr. Sarah Khan',
    },
    {
      id: '2',
      title: 'BCS Preparation Strategy for Beginners',
      category: 'Career',
      type: 'video',
      duration: '15 min watch',
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Career Coach Rahim',
    },
    {
      id: '3',
      title: 'How to Build a Resume that Stands Out',
      category: 'Career',
      type: 'article',
      duration: '8 min read',
      image:
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'HR Expert Nusrat',
    },
    {
      id: '4',
      title: 'Understanding Burnout vs. Stress',
      category: 'Mental Health',
      type: 'article',
      duration: '6 min read',
      image:
        'https://images.unsplash.com/photo-1499209974431-2761e2523cc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Bondhu Wellness Team',
    },
    {
      id: '5',
      title: '10 Minute Morning Yoga for Focus',
      category: 'Lifestyle',
      type: 'video',
      duration: '10 min watch',
      image:
        'https://images.unsplash.com/photo-1544367563-12123d8965cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Yoga with Aditi',
    },
    {
      id: '6',
      title: 'Effective Time Blocking Techniques',
      category: 'Academic',
      type: 'article',
      duration: '4 min read',
      image:
        'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Productivity Hacker',
    },
  ];

  const categories = ['All', 'Mental Health', 'Career', 'Academic', 'Lifestyle'];

  const filteredResources = resources.filter((r) => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">{t('pages.resources.title')}</h1>
        <p className="text-muted-foreground">{t('pages.resources.subtitle')}</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Search resources..."
            aria-label="Search resources"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-10 focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>

        <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={resource.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-card/90 px-2 py-1 text-xs font-bold text-foreground backdrop-blur-sm">
                {resource.type === 'video' ? <Video size={12} /> : <FileText size={12} />}
                {resource.type === 'video' ? 'Video' : 'Article'}
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 text-xs font-semibold tracking-wide text-primary uppercase">
                {resource.category}
              </div>
              <h3 className="mb-2 text-lg leading-tight font-bold text-foreground transition-colors group-hover:text-primary">
                {resource.title}
              </h3>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>{resource.author}</span>
                <span className="flex items-center gap-1">
                  {resource.type === 'video' ? <PlayCircle size={14} /> : <BookOpen size={14} />}
                  {resource.duration}
                </span>
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-2 font-medium text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground hover:bg-muted">
                View Resource <ExternalLink size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No resources found matching your criteria.</p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
            className="mt-2 font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
