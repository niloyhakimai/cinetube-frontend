"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link 
              href="/login" 
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-semibold transition-all shadow-[0_0_10px_rgba(229,9,20,0.5)]"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)} 
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

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 backdrop-blur-xl absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col shadow-2xl">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)} 
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/movies" 
              onClick={() => setIsOpen(false)} 
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Movies
            </Link>
            <Link 
              href="/series" 
              onClick={() => setIsOpen(false)} 
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Series
            </Link>
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)} 
              className="block mt-4 text-center bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-md font-semibold transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}   