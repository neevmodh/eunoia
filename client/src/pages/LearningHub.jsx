import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BookOpen, X, Bookmark, BookmarkCheck } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const categoryIcons = {
  'Menstrual Hygiene': '🧼',
  'Puberty Education': '🌱',
  'Nutrition': '🥗',
  'Exercise': '🏃‍♀️',
  'Mental Wellness': '💙',
  'Myths vs Facts': '🔍',
  'FAQs': '❓',
  'All': '📚'
};

const LearningHub = () => {
  const [content, setContent] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sakhicare_bookmarks') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    fetchContent();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchContent();
  }, [activeCategory, search]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (search) params.search = search;
      const res = await axios.get('/api/education', { params });
      setContent(res.data.data || []);
    } catch {
      toast.error('Could not load content.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/education/categories');
      setCategories(res.data.categories || ['All']);
    } catch {}
  };

  const toggleBookmark = (id) => {
    const updated = bookmarks.includes(id)
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('sakhicare_bookmarks', JSON.stringify(updated));
    toast.success(bookmarks.includes(id) ? 'Bookmark removed' : 'Bookmarked! 🔖');
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-sakhi-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-sakhi-200 dark:border-gray-600 hover:bg-sakhi-50'
            }`}
          >
            {categoryIcons[cat] || '📄'} {cat}
          </button>
        ))}
      </div>

      {/* Content grid */}
      {loading ? (
        <LoadingSpinner text="Loading articles..." />
      ) : content.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No articles found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.map(item => (
            <div key={item.id} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-sakhi-500 bg-sakhi-50 dark:bg-sakhi-900/20 px-2 py-0.5 rounded-full">
                  {categoryIcons[item.category] || '📄'} {item.category}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); toggleBookmark(item.id); }}
                  className="text-gray-300 hover:text-sakhi-500 transition-colors"
                  aria-label="Bookmark"
                >
                  {bookmarks.includes(item.id)
                    ? <BookmarkCheck size={16} className="text-sakhi-500" />
                    : <Bookmark size={16} />
                  }
                </button>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-2 group-hover:text-sakhi-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">{item.summary}</p>
              {item.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.split(';').slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => setSelected(item)}
                className="text-xs text-sakhi-500 hover:text-sakhi-700 font-medium"
              >
                Read more →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-sakhi-100 dark:border-gray-700 flex justify-between items-start">
              <div>
                <span className="text-xs text-sakhi-500 font-medium">{selected.category}</span>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mt-1">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                {selected.content || selected.summary}
              </p>
              <p className="text-xs text-gray-400 mt-4 italic">
                ⚠️ Educational content only. Not a substitute for professional medical advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningHub;
