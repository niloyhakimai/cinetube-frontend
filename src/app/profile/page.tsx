"use client";

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

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

interface Media {
  id: string;
  title: string;
  posterUrl: string;
  priceType: string;
}

interface Purchase {
  id: string;
  purchaseType: 'BUY' | 'RENT';
  amount: number;
  createdAt: string;
  expiresAt: string | null;
  media: Media;
}

export default function UserProfile() {
  const router = useRouter();
  const { user, isHydrated, updateUser, logout } = useAuth();
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [reviews, setReviews] = useState<ReviewActivity[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(10);
  const [editContent, setEditContent] = useState<string>('');
  
  const [isCanceling, setIsCanceling] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'activity' | 'purchases'>('activity');
  const userId = user?.id;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!userId) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const [userRes, watchlistRes, reviewsRes, purchasesRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/watchlist'),
          api.get('/reviews/me'),
          api.get('/payments/history'),
        ]);

        updateUser(userRes.data.user);
        setWatchlistCount(watchlistRes.data.watchlist.length);
        setReviews(reviewsRes.data.reviews);
        setPurchases(purchasesRes.data.purchases || []);

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isHydrated, router, updateUser, userId]);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your Premium Plan? You will lose access to Pro features immediately.')) return;

    setIsCanceling(true);
    try {
      await api.post('/subscriptions/cancel');
      toast.success('Your subscription has been canceled.');

      if (user) {
        const updatedUser = { ...user, subscriptionStatus: 'CANCELED', subscriptionPlan: 'FREE' };
        updateUser(updatedUser);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || 'Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleEditSubmit = async (reviewId: string) => {
    try {
      await api.put(`/reviews/${reviewId}`, {
        rating: editRating,
        content: editContent,
      });

      setReviews(reviews.map((review) =>
        review.id === reviewId
          ? { ...review, rating: editRating, content: editContent }
          : review,
      ));
      setEditingReviewId(null);
      toast.success('Review updated successfully');
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      alert(message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this pending review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((review) => review.id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      console.error('Error deleting review:', error);
      toast.error(message || 'Failed to delete review');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    setTimeout(() => router.push('/'), 1000);
  };

  if (!isHydrated || isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-10">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative mb-8">
          <div className="h-40 bg-gradient-to-r from-red-900/40 to-black w-full absolute top-0 left-0"></div>

          <div className="relative pt-20 px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-[#111] bg-red-600 flex items-center justify-center text-5xl font-extrabold shadow-xl z-10 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="text-center sm:text-left grow mb-2">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-400 mt-1">{user.email}</p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <span className="bg-white/10 border border-white/20 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                  {user.role}
                </span>
                
                {user.subscriptionStatus === 'ACTIVE' ? (
                  <span className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-extrabold shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                    PRO {user.subscriptionPlan === 'YEARLY' ? 'YEARLY' : 'MONTHLY'}
                  </span>
                ) : (
                  <span className="bg-green-500/10 border border-green-500/30 text-green-500 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                    Free Member
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {user.subscriptionStatus === 'ACTIVE' && (
                <button 
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 px-5 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                >
                  {isCanceling ? 'Canceling...' : 'Cancel Plan'}
                </button>
              )}

              <button 
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="md:col-span-2">
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
              <button 
                onClick={() => setActiveTab('activity')}
                className={`px-5 py-2 font-bold rounded-lg transition-all ${activeTab === 'activity' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(229,9,20,0.3)]' : 'bg-[#111]/60 text-gray-400 hover:text-white border border-white/5'}`}
              >
                Recent Activity
              </button>
              <button 
                onClick={() => setActiveTab('purchases')}
                className={`px-5 py-2 font-bold rounded-lg transition-all ${activeTab === 'purchases' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(229,9,20,0.3)]' : 'bg-[#111]/60 text-gray-400 hover:text-white border border-white/5'}`}
              >
                Purchase History
              </button>
            </div>

            {activeTab === 'activity' && (
              <div className="bg-[#111]/60 backdrop-blur-md p-6 rounded-xl border border-white/5 animate-in fade-in duration-300">
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
                      <div key={review.id} className="bg-[#222]/50 p-5 rounded-lg border border-white/5 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-white text-lg">Reviewed: {review.media.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            {!review.isApproved && (
                              <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Pending</span>
                            )}
                            <span className="bg-red-600/20 text-red-500 text-sm px-3 py-1 rounded font-bold">★ {review.rating}/10</span>
                          </div>
                        </div>

                        {editingReviewId === review.id ? (
                          <div className="mt-4 bg-[#111] p-4 rounded-md border border-white/10">
                            <label className="block text-xs text-gray-400 mb-1">Rating (1-10)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={editRating}
                              onChange={(e) => setEditRating(Number(e.target.value))}
                              className="w-full bg-[#333] text-white px-3 py-2 rounded mb-3 focus:outline-none focus:border-red-500"
                            />
                            <label className="block text-xs text-gray-400 mb-1">Review Content</label>
                            <textarea
                              rows={3}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full bg-[#333] text-white px-3 py-2 rounded mb-3 focus:outline-none focus:border-red-500 resize-none"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleEditSubmit(review.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold">Save Changes</button>
                              <button onClick={() => setEditingReviewId(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-bold">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-300 text-base leading-relaxed mt-2">&quot;{review.content}&quot;</p>

                            {!review.isApproved && (
                              <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                                <button
                                  onClick={() => {
                                    setEditingReviewId(review.id);
                                    setEditRating(review.rating);
                                    setEditContent(review.content);
                                  }}
                                  className="text-gray-400 hover:text-blue-500 text-sm font-medium flex items-center gap-1 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-gray-400 hover:text-red-500 text-sm font-medium flex items-center gap-1 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className="bg-[#111]/60 backdrop-blur-md p-6 rounded-xl border border-white/5 animate-in fade-in duration-300">
                {purchases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <span className="text-4xl mb-3 opacity-50">🎟️</span>
                    <p>Your library is empty.</p>
                    <p className="text-sm mt-1 mb-4">You have not bought or rented any movies yet.</p>
                    <Link href="/" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                      Explore Movies
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {purchases.map((purchase) => {
                      const isRent = purchase.purchaseType === 'RENT';
                      const isExpired = isRent && purchase.expiresAt ? new Date(purchase.expiresAt) < new Date() : false;

                      return (
                        <div key={purchase.id} className="bg-[#222]/50 rounded-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all flex flex-col">
                          <div className="aspect-video bg-[#111] relative">
                            <img 
                              src={purchase.media.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop"} 
                              alt={purchase.media.title}
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${isRent ? 'bg-blue-600/80 text-white' : 'bg-green-600/80 text-white'}`}>
                                {purchase.purchaseType}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4 flex flex-col grow">
                            <h3 className="font-bold mb-1 truncate text-white">{purchase.media.title}</h3>
                            <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                              <span>${purchase.amount.toFixed(2)}</span>
                              <span>•</span>
                              <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
                            </p>

                            <div className="mt-auto">
                              {isRent && !isExpired && purchase.expiresAt && (
                                <div className="mb-3 bg-blue-500/10 border border-blue-500/20 p-2 rounded text-[10px] text-blue-400 font-medium flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Expires: {new Date(purchase.expiresAt).toLocaleDateString()}
                                </div>
                              )}

                              {isExpired ? (
                                <button disabled className="w-full bg-gray-800/50 text-gray-500 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
                                  Expired
                                </button>
                              ) : (
                                <Link 
                                  href={`/movies/${purchase.media.id}`}
                                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                  Watch
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
