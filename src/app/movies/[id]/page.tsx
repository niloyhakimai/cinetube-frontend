"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';
import Link from 'next/link';

interface Media {
  id: string;
  title: string;
  synopsis: string;
  genre: string[];
  releaseYear: number;
  director: string;
  cast: string[];
  streamingLink: string;
  priceType: string;
}

interface Review {
  id: string;
  rating: number;
  content: string;
  user: { name: string };
  createdAt: string;
}

interface User {
  id: string; 
  name: string; 
  email: string; 
  role: string; 
  subscriptionStatus?: string; 
  subscriptionPlan?: string;
}

export default function MovieDetails() {
  const params = useParams();
  const { id } = params;

  const [movie, setMovie] = useState<Media | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Review Form State
  const [rating, setRating] = useState(10);
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchMovieAndReviews = async () => {
      try {
        const mediaRes = await api.get('/media');
        const foundMovie = mediaRes.data.media.find((m: Media) => m.id === id);
        setMovie(foundMovie);

        const reviewRes = await api.get(`/reviews/${id}`);
        setReviews(reviewRes.data.reviews);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchMovieAndReviews();
  }, [id]);

  const handleWatchlist = async () => {
    try {
      const response = await api.post('/watchlist/toggle', {
        mediaId: id,
      });
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Please log in to add to watchlist');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit a review.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/reviews', {
        mediaId: id,
        rating: Number(rating),
        content: reviewContent,
      });
      
      toast.success('Review submitted! Waiting for admin approval.');
      setReviewContent('');
      setRating(10);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return <div className="min-h-screen bg-[#050505] text-white flex justify-center items-center text-2xl">Movie not found!</div>;
  }

  // Extract YouTube ID for embed
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const trailerId = getYouTubeId(movie.streamingLink);

  // Lógica principal: Is the user allowed to play this movie?
  // Free movies can be played by anyone. Premium movies require an active subscription.
  const canPlayMovie = movie.priceType === 'FREE' || (user && user.subscriptionStatus === 'ACTIVE');

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <Toaster position="top-center" />
      
      {/* Hero Section with Trailer */}
      <div className="relative w-full h-[60vh] bg-black border-b border-white/10">
        {trailerId ? (
          <iframe 
            className="w-full h-full object-cover opacity-60 pointer-events-none" // pointer-events-none added to prevent playing from hero
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&loop=1&playlist=${trailerId}&controls=0`}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center text-gray-500">No Trailer Available</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
      </div>

      {/* Movie Details Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10">
        <div className="bg-[#111]/90 backdrop-blur-xl p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-3 text-white tracking-tight">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-medium mb-8">
                <span className="bg-white/10 px-3 py-1 rounded-full">{movie.releaseYear}</span>
                <span className={`px-3 py-1 border rounded-full font-bold tracking-wider text-xs uppercase ${movie.priceType === 'PREMIUM' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : 'border-green-500/50 text-green-500 bg-green-500/10'}`}>
                  {movie.priceType}
                </span>
                <span className="text-red-500 flex gap-2">
                  {movie.genre.map((g, i) => (
                    <span key={i} className="hover:text-red-400 cursor-pointer">{g}</span>
                  ))}
                </span>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-3xl">{movie.synopsis}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm bg-black/30 p-5 rounded-xl border border-white/5">
                <div>
                  <span className="text-gray-500 block mb-1 uppercase tracking-wider text-xs font-bold">Director</span>
                  <span className="font-semibold text-white text-base">{movie.director}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1 uppercase tracking-wider text-xs font-bold">Main Cast</span>
                  <span className="font-semibold text-white text-base">{movie.cast.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Panel */}
            <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[250px] shrink-0">
              
              {!canPlayMovie ? (
                // Show Buy Premium Button if user is not subbed and movie is premium
                <Link 
                  href="/#pricing" // Redirecting to home pricing section is better than hardcoding /subscribe/monthly
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-6 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                  Unlock Premium
                </Link>
              ) : (
                // Show Play Button if free or user is subbed
                <a 
                  href={movie.streamingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  Play Full Movie
                </a>
              )}

              <button 
                onClick={handleWatchlist}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add to Watchlist
              </button>
            </div>

          </div>
        </div>

        {/* Reviews Section Area (Kept Mostly Same, Just styling tweaks) */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-1">
            <div className="bg-[#111]/80 backdrop-blur-md p-8 rounded-2xl border border-white/10 sticky top-24">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-red-600 rounded-full"></span>
                Write a Review
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Rating (1-10)</label>
                  <input 
                    type="number" min="1" max="10" 
                    value={rating} onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 border border-white/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Thoughts</label>
                  <textarea 
                    rows={5} value={reviewContent} onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="What did you think about this movie?"
                    className="w-full bg-black/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 border border-white/10 resize-none transition-all"
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-white hover:bg-gray-200 text-black font-extrabold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-white/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h3 className="text-3xl font-bold">Audience Reviews</h3>
              <span className="bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-bold border border-white/5">
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>
            
            {reviews.length === 0 ? (
              <div className="bg-[#111]/50 p-12 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                <span className="text-6xl mb-4 opacity-50">🍿</span>
                <p className="text-xl font-medium text-gray-400">No reviews yet.</p>
                <p className="text-gray-500 mt-2">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-[#111]/80 hover:bg-[#151515] p-6 md:p-8 rounded-2xl border border-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold text-xl shadow-lg border border-red-500/30">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{review.user.name}</p>
                          <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {review.rating}/10
                      </div>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">{review.content}</p>
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