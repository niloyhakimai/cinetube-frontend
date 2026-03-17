"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ReviewActivity {
  id: string;
  rating: number;
  content: string;
  isApproved: boolean;
  createdAt: string;
  media: {
    title: string;
  };
}

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [reviews, setReviews] = useState<ReviewActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    const fetchUserData = async () => {
      try {
        // Fetch Watchlist
        const watchlistRes = await api.get('/watchlist');
        setWatchlistCount(watchlistRes.data.watchlist.length);

        // Fetch User's Reviews
        const reviewsRes = await api.get('/reviews/me');
        setReviews(reviewsRes.data.reviews);

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header Card */}
        <div className="bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative mb-8">
          <div className="h-40 bg-gradient-to-r from-red-900/40 to-black w-full absolute top-0 left-0"></div>
          
          <div className="relative pt-20 px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-[#111] bg-red-600 flex items-center justify-center text-5xl font-extrabold shadow-xl z-10 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="text-center sm:text-left flex-grow mb-2">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-400 mt-1">{user.email}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <span className="bg-white/10 border border-white/20 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                  {user.role}
                </span>
                <span className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                  Active Member
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stats Cards */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#111]/60 backdrop-blur-md p-6 rounded-xl border border-white/5">
              <h3 className="text-gray-400 text-sm font-medium mb-1">My Watchlist</h3>
              <p className="text-4xl font-extrabold text-white mb-4">{watchlistCount}</p>
              <Link href="/watchlist" className="text-red-500 hover:text-red-400 text-sm font-semibold flex items-center gap-1">
                View Collection <span>&rarr;</span>
              </Link>
            </div>

            <div className="bg-[#111]/60 backdrop-blur-md p-6 rounded-xl border border-white/5">
              <h3 className="text-gray-400 text-sm font-medium mb-1">Reviews Given</h3>
              <p className="text-4xl font-extrabold text-white mb-4">{reviews.length}</p>
              <span className="text-gray-500 text-sm">Keep watching and rating!</span>
            </div>
          </div>

          {/* Activity/History Section */}
          <div className="md:col-span-2 bg-[#111]/60 backdrop-blur-md p-6 rounded-xl border border-white/5">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Recent Activity (Reviews)</h2>
            
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No recent activity found.</p>
                <p className="text-sm mt-1">Movies you review will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-[#222]/50 p-4 rounded-lg border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">Reviewed: {review.media.title}</h4>
                      <div className="flex gap-2">
                        {!review.isApproved && (
                          <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded font-bold">Pending</span>
                        )}
                        <span className="bg-red-600/20 text-red-500 text-xs px-2 py-0.5 rounded font-bold">★ {review.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm italic">"{review.content}"</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}