"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AdvancedSearch from './AdvancedSearch'; 
import { useAuth } from '@/context/AuthContext';

function SearchFallback() {
  return <div className="h-11 w-full max-w-sm rounded-full bg-white/10 animate-pulse"></div>;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout, isHydrated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsOpen(false);
    toast.success('Logged out successfully!');
    router.push('/login');
  };

  return (
    <nav className="fixed w-full z-50 top-0 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Added 'relative' class for proper positioning of the center items */}
        <div className="flex justify-between items-center h-20 relative">
          
          {/* 1. Left Section (Logo) */}
          <div className="flex-1 flex justify-start items-center">
            <Link href="/" className="text-red-600 text-3xl font-extrabold tracking-widest uppercase shrink-0">
              CineTube
            </Link>
          </div>

          {/* 2. Center Section (Navigation Links) - Shifted slightly left with reduced margin */}
          <div className="hidden md:flex absolute left-[45%] transform -translate-x-1/2 space-x-6">
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

          {/* 3. Right Section (Search & Profile) */}
          <div className="hidden md:flex flex-1 items-center justify-end space-x-6 min-w-0">
            
            {/* Advanced Search Component */}
            <div className="w-full max-w-sm flex justify-end">
              <Suspense fallback={<SearchFallback />}>
                <AdvancedSearch />
              </Suspense>
            </div>

            {/* Conditional Rendering based on Auth State */}
            {!isHydrated ? (
              <div className="h-10 w-24 shrink-0 rounded-md bg-white/10 animate-pulse"></div>
            ) : user ? (
              <div className="relative shrink-0">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold text-lg hover:ring-2 hover:ring-red-400 transition-all shadow-lg"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-[#111] border border-white/10 rounded-md shadow-2xl py-1 backdrop-blur-xl z-50">
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
                className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-semibold transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu & Search Buttons */}
          <div className="md:hidden flex items-center space-x-4 shrink-0">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsOpen(false);
              }}
              className="text-gray-300 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => {
                setIsOpen(!isOpen);
                setIsSearchOpen(false);
              }} 
              className="text-gray-300 hover:text-white focus:outline-none p-2"
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

      {/* Mobile Search Bar Area (Contains AdvancedSearch) */}
      {isSearchOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 backdrop-blur-xl px-4 py-3 w-full absolute top-20 left-0 shadow-xl">
          <Suspense fallback={<SearchFallback />}>
            <AdvancedSearch />
          </Suspense>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 backdrop-blur-xl absolute top-20 left-0 w-full min-h-screen">
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
                <Link href="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">My Profile</Link>
                <Link href="/watchlist" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">My Watchlist</Link>
                <button onClick={handleLogout} className="block w-full text-left mt-4 bg-red-600/10 text-red-500 hover:bg-red-600/20 px-5 py-3 rounded-md font-semibold transition-all">Sign Out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="block mt-4 text-center bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-md font-semibold transition-all shadow-[0_0_10px_rgba(229,9,20,0.4)]">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
