"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'USER') {
      router.push('/profile');
    }
  }, [isHydrated, router, user]);

  if (!isHydrated || !user || user.role === 'USER') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-white/10 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">Role Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold text-white">
            {user.role === 'ADMIN' ? 'Admin Dashboard' : user.role === 'MODERATOR' ? 'Moderator Dashboard' : 'Curator Dashboard'}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
