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

export default function MovieDetails() {
  const params = useParams();
  const { id } = params;

  const [movie, setMovie] = useState<Media | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Form State
  const [rating, setRating] = useState(10);
  const [reviewContent, setReviewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMovieAndReviews = async () => {
      try {
        // Fetch all media and find the specific one (Temporary workaround if getMediaById doesn't exist)
        const mediaRes = await api.get('/media');
        const foundMovie = mediaRes.data.media.find((m: Media) => m.id === id);
        setMovie(foundMovie);

        // Fetch approved reviews for this specific media
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
    setIsSubmitting(true);

    try {
      await api.post('/reviews', {
        mediaId: id,
        rating: Number(rating),
        content: reviewContent,
        tags: ["Review"],
        isSpoiler: false,
      });
      
      toast.success('Review submitted! Waiting for admin approval.');
      setReviewContent('');
      setRating(10);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review. Are you logged in?');
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

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <Toaster position="top-center" />
      
      {/* Hero Section with Trailer */}
      <div className="relative w-full h-[60vh] bg-black border-b border-white/10">
        {trailerId ? (
          <iframe 
            className="w-full h-full object-cover opacity-60"
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&loop=1&playlist=${trailerId}`}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">No Trailer Available</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
      </div>

      {/* Movie Details Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Movie Info */}
          <div className="flex-grow bg-[#111]/80 backdrop-blur-xl p-8 rounded-xl border border-white/10 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{movie.title}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-gray-400 font-medium mb-6">
                  <span>{movie.releaseYear}</span>
                  <span className={`px-2 py-0.5 border rounded font-bold ${movie.priceType === 'PREMIUM' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}>
                    {movie.priceType}
                  </span>
                  <span className="text-red-500">{movie.genre.join(', ')}</span>
                </div>
              </div>

              {/* Action Buttons: Premium/Play & Watchlist */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                {movie.priceType === 'PREMIUM' ? (
                  <Link 
                    href={`/checkout/${movie.id}`}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-6 py-3 rounded font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                    Buy Premium Access
                  </Link>
                ) : (
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold transition-colors shadow-[0_0_15px_rgba(22,163,7,0.4)] flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    Play Full Movie
                  </button>
                )}

                <button 
                  onClick={handleWatchlist}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Watchlist
                </button>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6 mt-6">{movie.synopsis}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Director</span>
                <span className="font-semibold">{movie.director}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Cast</span>
                <span className="font-semibold">{movie.cast.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submit Review Form */}
          <div className="lg:col-span-1 bg-[#111] p-6 rounded-xl border border-white/10 h-fit">
            <h3 className="text-xl font-bold mb-4 border-l-4 border-red-600 pl-3">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Rating (1-10)</label>
                <input 
                  type="number" 
                  min="1" max="10" 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-[#222] text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-white/5"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Your Review</label>
                <textarea 
                  rows={4} 
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="What did you think about this movie?"
                  className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-white/5 resize-none"
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 rounded transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Display Approved Reviews */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-6">User Reviews ({reviews.length})</h3>
            
            {reviews.length === 0 ? (
              <div className="text-gray-500 bg-[#111] p-8 rounded-xl border border-white/10 text-center">
                No reviews yet. Be the first to review this movie!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-[#111]/50 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{review.user.name}</p>
                          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded font-bold">
                        ★ {review.rating}/10
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{review.content}</p>
                    
                    {/* Like / Comment Interaction placeholders */}
                    <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 text-sm text-gray-400">
                      <button className="hover:text-white transition-colors flex items-center gap-1">
                        <span>👍</span> Helpful
                      </button>
                      <button className="hover:text-white transition-colors flex items-center gap-1">
                        <span>💬</span> Reply
                      </button>
                    </div>
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