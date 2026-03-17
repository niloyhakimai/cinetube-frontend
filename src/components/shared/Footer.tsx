import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          {/* Brand Info */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h2 className="text-red-600 text-2xl font-bold tracking-widest mb-2">CINETUBE</h2>
            <p className="text-gray-500 text-sm">
              Your ultimate destination for movies and series.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex space-x-6 mb-6 md:mb-0">
            <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link>
            <Link href="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link>
          </div>

        </div>
        
        {/* Copyright */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} CineTube. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
