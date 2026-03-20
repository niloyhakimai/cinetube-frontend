"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';
import MovieSlider from '@/components/home/MovieSlider';

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

interface Comment {
  id: string;
  content: string;
  user: { name: string; id: string };
  createdAt: string;
}

interface Like {
  id: string;
  userId: string;
}

interface Review {
  id: string;
  rating: number;
  content: string;
  isSpoiler?: boolean;
  tags?: string[];
  user: { name: string; id: string };
  createdAt: string;
  likes: Like[];
  comments: Comment[];
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
  const router = useRouter();
  const { id } = params;

  const [movie, setMovie] = useState<Media | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(10);
  const [reviewContent, setReviewContent] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tags State
  const AVAILABLE_TAGS = ['Classic', 'Underrated', 'Masterpiece', 'Overrated', 'Action-Packed', 'Tearjerker', 'Mind-Bending', 'Family-Friendly'];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Comment Reply State
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchMovieDetails = async () => {
      try {
        const res = await api.get(`/media/${id}`);
        setMovie(res.data.media);
      
        if (res.data.media.reviews) {
          setReviews(res.data.media.reviews);
        }

        if (res.data.similarMedia) {
          const formattedSimilar = res.data.similarMedia.map((item: any) => ({
            id: item.id,
            title: item.title,
            image: item.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop",
            rating: item.averageRating || 0,
            year: item.releaseYear,
            genre: item.genre?.[0] || 'Unknown'
          }));
          setSimilarMovies(formattedSimilar);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchMovieDetails();
  }, [id]);

  const handleWatchlist = async () => {
    try {
      const response = await api.post('/watchlist/toggle', { mediaId: id });
      toast.success(response.data.message || 'Updated Watchlist!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Please log in to add to watchlist');
    }
  };

  const handlePremiumClick = () => {
    toast('Please become a premium member to access this content! 👑', {
      icon: '🔒',
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
      duration: 3000,
    });

    setTimeout(() => {
      router.push('/#pricing');
    }, 2000);
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
        isSpoiler: isSpoiler,
        tags: selectedTags
      });
      
      toast.success('Review submitted! Waiting for admin approval.');
      setReviewContent('');
      setRating(10);
      setIsSpoiler(false);
      setSelectedTags([]); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeToggle = async (reviewId: string) => {
    if (!user) {
      toast.error("Please log in to like reviews.");
      return;
    }

    setReviews(currentReviews => 
      currentReviews.map(review => {
        if (review.id === reviewId) {
          const hasLiked = review.likes.some(like => like.userId === user.id);
          const newLikes = hasLiked 
            ? review.likes.filter(like => like.userId !== user.id)
            : [...review.likes, { id: 'temp-id', userId: user.id }];
          return { ...review, likes: newLikes };
        }
        return review;
      })
    );

    try {
      await api.post(`/reviews/${reviewId}/like`);
    } catch (error) {
      toast.error("Failed to update like status.");
      const res = await api.get(`/media/${id}`);
      if (res.data.media.reviews) setReviews(res.data.media.reviews);
    }
  };

  const handleCommentSubmit = async (reviewId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to reply.");
      return;
    }
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await api.post(`/reviews/${reviewId}/comment`, {
        content: replyContent
      });

      setReviews(currentReviews => 
        currentReviews.map(review => {
          if (review.id === reviewId) {
            return {
              ...review,
              comments: [res.data.comment, ...review.comments]
            };
          }
          return review;
        })
      );
      
      toast.success("Reply added!");
      setReplyContent('');
      setActiveReplyId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // --- NEW: Admin Delete Review Function ---
  const handleAdminDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Admin Action: Are you sure you want to permanently delete this inappropriate review?")) return;
    
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted successfully by Admin!");
      setReviews(currentReviews => currentReviews.filter(r => r.id !== reviewId));
    } catch (error: any) {

      toast.error(error.response?.data?.message || "Failed to delete the review.");
      console.error("Delete Error:", error.response?.data);
    }
  };
  // ----------------------------------------

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      toast.error('You can only select up to 3 tags.');
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
    return <div className="min-h-screen bg-[#050505] text-white flex justify-center items-center text-2xl font-bold">🎬 Movie not found!</div>;
  }

  const getYouTubeId = (url: string) => {
    if(!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const trailerId = getYouTubeId(movie.streamingLink);
  const canPlayMovie = movie.priceType === 'FREE' || (user && user.subscriptionStatus === 'ACTIVE') || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <Toaster position="top-center" />
      
      {/* HERO SECTION */}
      <div className="relative w-full h-[50vh] md:h-[70vh] bg-black border-b border-white/10 group">
        {trailerId ? (
          isPlaying ? (
            <iframe 
              className="w-full h-full object-cover animate-in fade-in duration-500"
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&controls=1&rel=0`}
              title="Movie Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <>
              <iframe 
                className="w-full h-full object-cover opacity-50 pointer-events-none"
                src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&loop=1&playlist=${trailerId}&controls=0`}
                title="Movie Trailer"
                frameBorder="0"
                allow="autoplay"
              ></iframe>
              <div className="absolute inset-0 flex items-center justify-center">
                {canPlayMovie && (
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="bg-red-600/80 hover:bg-red-600 text-white rounded-full p-6 backdrop-blur-md shadow-[0_0_30px_rgba(229,9,20,0.5)] transform hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  </button>
                )}
              </div>
            </>
          )
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center text-gray-500 font-bold">No Media Source Available</div>
        )}
        {!isPlaying && <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none"></div>}
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-500 ${isPlaying ? 'mt-8' : '-mt-32'}`}>
        <div className="bg-[#111]/90 backdrop-blur-xl p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-white tracking-tight">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-medium mb-6">
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

            <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[250px] shrink-0">
              {!canPlayMovie ? (
                <button 
                  onClick={handlePremiumClick}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-6 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                  Unlock Premium
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsPlaying(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  {isPlaying ? 'Now Playing' : 'Play Full Movie'}
                </button>
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

        {/* --- REVIEWS SECTION --- */}
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

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Tags (Max 3)</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          selectedTags.includes(tag) 
                            ? 'bg-red-600 text-white border border-red-500 shadow-[0_0_10px_rgba(229,9,20,0.4)]' 
                            : 'bg-black/50 text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" id="spoiler" 
                    checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-600"
                  />
                  <label htmlFor="spoiler" className="text-sm font-medium text-gray-400 cursor-pointer">This review contains spoilers</label>
                </div>

                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-white hover:bg-gray-200 text-black font-extrabold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-white/20 mt-2"
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
              <div className="space-y-6">
                {reviews.map((review) => {
                  const hasLiked = user ? review.likes?.some(like => like.userId === user.id) : false;
                  
                  return (
                    <div key={review.id} className="bg-[#111]/80 hover:bg-[#151515] p-6 md:p-8 rounded-2xl border border-white/5 transition-colors relative overflow-hidden">
                      {review.isSpoiler && (
                        <div className="absolute top-0 right-0 bg-red-600/20 text-red-500 text-xs font-bold px-3 py-1 rounded-bl-lg border-b border-l border-red-500/20">
                          SPOILER
                        </div>
                      )}
                      
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
                        
                        <div className="flex items-center gap-3 mt-2 md:mt-0">
                          {/* --- Admin Delete Button --- */}
                          {user?.role === 'ADMIN' && (
                            <button 
                              onClick={() => handleAdminDeleteReview(review.id)}
                              className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-lg transition-colors border border-red-500/20"
                              title="Delete Review (Admin)"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                          <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            {review.rating}/10
                          </div>
                        </div>
                      </div>

                      <p className={`text-lg leading-relaxed ${review.isSpoiler ? 'text-transparent bg-gray-800 rounded px-2 select-all hover:text-gray-300 hover:bg-transparent transition-all cursor-help' : 'text-gray-300'}`}>
                        {review.content}
                      </p>

                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 mb-4">
                          {review.tags.map((tag, i) => (
                            <span key={i} className="bg-white/5 text-gray-300 px-2 py-1 rounded text-xs border border-white/5">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 border-t border-white/10 pt-4 mt-6">
                        <button 
                          onClick={() => handleLikeToggle(review.id)}
                          className={`flex items-center gap-2 text-sm font-bold transition-colors ${hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                        >
                          <svg className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {review.likes?.length || 0}
                        </button>
                        
                        <button 
                          onClick={() => setActiveReplyId(activeReplyId === review.id ? null : review.id)}
                          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          Reply
                        </button>
                      </div>

                      {activeReplyId === review.id && (
                        <form onSubmit={(e) => handleCommentSubmit(review.id, e)} className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
                          <input 
                            type="text" 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                            autoFocus
                          />
                          <button 
                            type="submit" 
                            disabled={isSubmittingReply || !replyContent.trim()}
                            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors"
                          >
                            Post
                          </button>
                        </form>
                      )}

                      {review.comments && review.comments.length > 0 && (
                        <div className="mt-6 space-y-4 pl-4 border-l-2 border-white/10">
                          {review.comments.map(comment => (
                            <div key={comment.id} className="bg-black/30 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-white text-sm">{comment.user.name}</span>
                                <span className="text-xs text-gray-500">• {new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-300 text-sm">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {similarMovies.length > 0 && (
          <div className="mt-20 border-t border-white/10 pt-10 pb-10">
            <MovieSlider title="More Like This" movies={similarMovies} />
          </div>
        )}

      </div>
    </div>
  );
}