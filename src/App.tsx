import React, { useState, useEffect } from 'react';
import { Search, Book as BookIcon, Loader2, ExternalLink, X, Settings, Star, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from './types';
import { searchBooks, getBookCoverUrl, getBooksBySubject } from './services/openLibrary';

const CATEGORIES = [
  "Science Fiction",
  "Fantasy",
  "Romance",
  "Mystery & Thriller",
  "History"
];

export default function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [view, setView] = useState<'home' | 'about'>('home');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setActiveCategory(''); // Clear category when searching
    try {
      const data = await searchBooks(query);
      setBooks(data.docs);
    } catch (err) {
      setError('حدث خطأ أثناء البحث عن الكتب. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategory = async (category: string) => {
    setLoading(true);
    setError(null);
    setActiveCategory(category);
    setQuery('');
    try {
      const data = await getBooksBySubject(category);
      setBooks(data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل التصنيف.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategory(CATEGORIES[0]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="bg-[#f27d26] p-2 rounded-xl shadow-lg shadow-orange-200 cursor-pointer" onClick={() => window.location.reload()}>
            <BookIcon className="text-white w-6 h-6" />
          </div>
          <nav className="flex items-center gap-2">
            <button 
              onClick={() => setView('home')}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${view === 'home' ? 'bg-[#fff1e6] text-[#f27d26]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('about')}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${view === 'about' ? 'bg-[#fff1e6] text-[#f27d26]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              About
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search books..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </form>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl flex items-center gap-8 py-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => loadCategory(cat)}
              className={`relative py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'text-[#f27d26]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div 
                  layoutId="activeCategory"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f27d26]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
        {view === 'about' ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <h2 className="text-3xl font-bold mb-6 font-serif">About Open Library Explorer</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              This application is a modern interface for exploring the vast collection of books available at Open Library. 
              Our goal is to make it easy for readers to discover new titles, explore different genres, and access detailed information about their favorite books.
            </p>
            <div className="bg-indigo-50 p-6 rounded-2xl text-indigo-700 font-medium">
              Powered by the Open Library API - One web page for every book ever published.
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <X className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 text-[#f27d26] animate-spin" />
                <p className="text-slate-400 font-medium">Loading books...</p>
              </div>
            ) : (
              <>
                {books.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {books.map((book, index) => (
                      <motion.div
                        key={book.key + index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedBook(book)}
                        className="group cursor-pointer"
                      >
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-slate-100">
                          <img
                            src={getBookCoverUrl(book.cover_i, 'M')}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="mt-3">
                          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-[#f27d26] transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 truncate">
                            {book.author_name?.[0] || 'Unknown Author'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="text-slate-300 w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No books found</h2>
                    <p className="text-slate-400">Try searching for something else or select a category.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Book Details Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              <div className="w-full md:w-2/5 bg-slate-50 flex items-center justify-center p-10">
                <div className="w-full max-w-[240px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transform -rotate-2">
                  <img
                    src={getBookCoverUrl(selectedBook.cover_i, 'L')}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="w-full md:w-3/5 p-8 sm:p-10 overflow-y-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-2 font-serif leading-tight">
                  {selectedBook.title}
                </h2>
                <p className="text-xl text-[#f27d26] font-medium mb-8">
                  {selectedBook.author_name?.join(', ') || 'Unknown Author'}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Published</p>
                      <p className="text-sm font-bold text-slate-700">{selectedBook.first_publish_year || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Rating</p>
                      <p className="text-sm font-bold text-slate-700">{selectedBook.ratings_average?.toFixed(1) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`https://openlibrary.org${selectedBook.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#f27d26] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#d96a1a] transition-colors shadow-lg shadow-orange-100"
                  >
                    View on Open Library
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
