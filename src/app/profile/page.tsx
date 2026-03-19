"use client";

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';

// Update: Added subscription fields to the interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
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
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(10);
  const [editContent, setEditContent] = useState<string>('');
  
  // NEW: State for the cancel button
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    // Note: We are relying on localStorage for instant UI updates after payment
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    const fetchUserData = async () => {
      try {
        const watchlistRes = await api.get('/watchlist');
        setWatchlistCount(watchlistRes.data.watchlist.length);

        const reviewsRes = await api.get('/reviews/me');
        setReviews(reviewsRes.data.reviews);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // NEW: Cancel Subscription Function
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your Premium Plan? You will lose access to Pro features immediately.')) return;

    setIsCanceling(true);
    try {
      await api.post('/subscriptions/cancel');
      toast.success('Your subscription has been canceled.');

      // Update local storage and UI instantly
      if (user) {
        const updatedUser = { ...user, subscriptionStatus: 'CANCELED', subscriptionPlan: 'FREE' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
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

  if (isLoading || !user) {
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
                
                {/* Update: Dynamic Premium Badge Rendering */}
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
              {/* NEW: Cancel Button (Only show if ACTIVE) */}
              {user.subscriptionStatus === 'ACTIVE' && (
                <button 
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 px-5 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                >
                  {isCanceling ? 'Canceling...' : 'Cancel Plan'}
                </button>
              )}

              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm">
                Edit Profile
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
        </div>
      </div>
    </div>
  );
}