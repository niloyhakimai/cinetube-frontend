"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'ADMIN') {
          setIsAuthorized(true);
        } else {
          // If logged in but not an admin, redirect to home
          router.push('/');
        }
      } else {
        // If not logged in at all, redirect to login
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show a dark loading screen while checking authorization
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">
          Admin Dashboard
        </h1>
        {children}
      </div>
    </div>
  );
}