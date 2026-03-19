"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const router = useRouter();

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Read the search query from the URL if it exists
    const params = new URLSearchParams(window.location.search);
    const searchFromUrl = params.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after submitting
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileOpen(false);
    setIsOpen(false);
    toast.success('Logged out successfully!');
    router.push('/login');
  };

  return (
    <nav className="fixed w-full z-50 top-0 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link href="/" className="text-red-600 text-3xl font-extrabold tracking-widest uppercase">
            CineTube
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white font-medium transition-colors">
              Home
            </Link>
            <Link href="/movies" className="text-gray-300 hover:text-white font-medium transition-colors">
              Movies
            </Link>
            <Link href="/series" className="text-gray-300 hover:text-white font-medium transition-colors">
              Series
            </Link>
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-red-600 px-2 py-1 w-40 md:w-48 text-sm transition-all"
              />
              <button type="submit" className="text-gray-300 hover:text-white transition-colors absolute right-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Conditional Rendering based on Auth State */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold text-lg hover:ring-2 hover:ring-red-400 transition-all"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-[#111] border border-white/10 rounded-md shadow-lg py-1 backdrop-blur-xl z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-white font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link 
                      href="/profile" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 pb-3 mb-1"
                    >
                      My Profile
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link 
                        href="/admin" 
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <Link 
                      href="/watchlist" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      My Watchlist
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-semibold transition-all shadow-[0_0_10px_rgba(229,9,20,0.5)]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsOpen(false);
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              onClick={() => {
                setIsOpen(!isOpen);
                setIsSearchOpen(false);
              }} 
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 backdrop-blur-xl px-4 py-3">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-b border-white/30 text-white focus:outline-none focus:border-red-600 px-2 py-2 text-sm transition-all"
              autoFocus
            />
            <button 
              type="submit" 
              className="text-gray-300 hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 backdrop-blur-xl absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col shadow-2xl">
            {user && (
              <div className="px-3 py-3 border-b border-white/10 mb-2">
                <p className="text-base font-medium text-white">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            )}
            
            <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Home</Link>
            <Link href="/movies" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Movies</Link>
            <Link href="/series" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Series</Link>
            
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-yellow-500 hover:bg-white/5 transition-colors">Admin Dashboard</Link>
                )}
                <Link href="/watchlist" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">My Watchlist</Link>
                <button onClick={handleLogout} className="block w-full text-left mt-4 bg-red-600/20 text-red-500 px-5 py-3 rounded-md font-semibold transition-all">Sign Out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="block mt-4 text-center bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-md font-semibold transition-all">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}