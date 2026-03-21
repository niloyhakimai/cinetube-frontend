"use client";

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // States for Add/Edit Media
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', synopsis: '', genre: '', releaseYear: '', 
    director: '', cast: '', streamingPlatform: '', priceType: 'FREE', streamingLink: '',
    posterUrl: '',
    isFeatured: false,
  });

  // States for Dashboard Overview & Reviews
  const [adminData, setAdminData] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // States for Manage Media List
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Fetch Dashboard Stats, Pending Reviews, or Media List when tab changes
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'manage-reviews') {
      fetchAdminStats();
    }
    if (activeTab === 'manage-media') {
      fetchMediaList();
    }
  }, [activeTab]);

  const fetchAdminStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await api.get('/admin/dashboard');
      setAdminData(response.data);
    } catch (error) {
      console.error("Failed to load admin data", error);
      toast.error('Failed to load admin stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchMediaList = async () => {
    setIsLoadingMedia(true);
    try {
      const response = await api.get('/media', { params: { source: 'MANUAL' } });
      setMediaList(response.data.media || []);
    } catch (error) {
      toast.error('Failed to load media list');
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await api.put(`/reviews/${reviewId}/approve`);
      toast.success('Review approved successfully!');
      setAdminData((prev: any) => ({
        ...prev,
        stats: { ...prev.stats, pendingReviewCount: prev.stats.pendingReviewCount - 1 },
        pendingReviews: prev.pendingReviews.filter((r: any) => r.id !== reviewId)
      }));
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted successfully!');
      setAdminData((prev: any) => ({
        ...prev,
        stats: { ...prev.stats, pendingReviewCount: prev.stats.pendingReviewCount - 1 },
        pendingReviews: prev.pendingReviews.filter((r: any) => r.id !== reviewId)
      }));
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  // --- NEW: Edit & Delete Media Functions ---
  const handleEditMediaClick = (media: any) => {
    setEditId(media.id);
    setFormData({
      title: media.title || '',
      synopsis: media.synopsis || '',
      genre: media.genre ? media.genre.join(', ') : '',
      releaseYear: media.releaseYear?.toString() || '',
      director: media.director || '',
      cast: media.cast ? media.cast.join(', ') : '',
      streamingPlatform: media.streamingPlatform ? media.streamingPlatform.join(', ') : '',
      priceType: media.priceType || 'FREE',
      streamingLink: media.streamingLink || '',
      posterUrl: media.posterUrl || '',
      isFeatured: media.isFeatured || false,
    });
    setActiveTab('add-media'); 
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this media?")) return;
    try {
      await api.delete(`/media/${mediaId}`);
      toast.success('Media deleted successfully!');
      setMediaList((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };
  // ----------------------------------------

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleFeatured = () => {
    setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }));
  };

  const handleMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const formattedData = {
      ...formData,
      releaseYear: parseInt(formData.releaseYear),
      genre: formData.genre.split(',').map((item) => item.trim()),
      cast: formData.cast.split(',').map((item) => item.trim()),
      streamingPlatform: formData.streamingPlatform.split(',').map((item) => item.trim()),
    };

    try {
      if (editId) {
        // Edit Mode: PUT Request
        await api.put(`/media/${editId}`, formattedData);
        toast.success('Media updated successfully!');
        setEditId(null);
      } else {
        // Add Mode: POST Request
        await api.post('/media', formattedData);
        toast.success('Media added successfully!');
      }
      
      // Reset form
      setFormData({
        title: '', synopsis: '', genre: '', releaseYear: '', director: '', 
        cast: '', streamingPlatform: '', priceType: 'FREE', streamingLink: '',
        posterUrl: '',
        isFeatured: false,
      });
      if (editId) setActiveTab('manage-media'); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process media');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-[#111] p-4 md:p-8 rounded-xl border border-white/10 shadow-2xl">
      <Toaster position="top-right" />
      
      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 md:space-x-4 mb-8 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold rounded transition-colors ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'text-gray-400 hover:text-white bg-white/5'}`}
        >
          Dashboard Stats
        </button>
        <button 
          onClick={() => {
            setActiveTab('add-media');
            setEditId(null);
            setFormData({title: '', synopsis: '', genre: '', releaseYear: '', director: '', cast: '', streamingPlatform: '', priceType: 'FREE', streamingLink: '', posterUrl: '', isFeatured: false});
          }}
          className={`px-4 py-2 font-bold rounded transition-colors ${activeTab === 'add-media' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'text-gray-400 hover:text-white bg-white/5'}`}
        >
          {editId ? 'Edit Media' : 'Add Media'}
        </button>
        {/* --- NEW TAB BUTTON --- */}
        <button 
          onClick={() => setActiveTab('manage-media')}
          className={`px-4 py-2 font-bold rounded transition-colors ${activeTab === 'manage-media' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'text-gray-400 hover:text-white bg-white/5'}`}
        >
          Manage Media
        </button>
        <button 
          onClick={() => setActiveTab('manage-reviews')}
          className={`px-4 py-2 font-bold rounded transition-colors flex items-center gap-2 ${activeTab === 'manage-reviews' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'text-gray-400 hover:text-white bg-white/5'}`}
        >
          Manage Reviews
          {adminData?.stats?.pendingReviewCount > 0 && (
            <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs animate-pulse">
              {adminData.stats.pendingReviewCount}
            </span>
          )}
        </button>
      </div>

      {/* --- TAB 1: DASHBOARD OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {isLoadingStats ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              Loading system analytics...
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: adminData?.stats?.totalUsers || 0, icon: '👥', border: 'border-blue-500/30' },
                  { label: 'Total Media', value: adminData?.stats?.totalMedia || 0, icon: '🎬', border: 'border-purple-500/30' },
                  { label: 'Published Reviews', value: adminData?.stats?.totalReviews || 0, icon: '⭐', border: 'border-green-500/30' },
                  { label: 'Pending Reviews', value: adminData?.stats?.pendingReviewCount || 0, icon: '⏳', border: 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' }
                ].map((stat, i) => (
                  <div key={i} className={`bg-[#1a1a1a] p-5 rounded-xl border ${stat.border} flex flex-col items-center justify-center text-center`}>
                    <span className="text-2xl mb-2">{stat.icon}</span>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                    <span className="text-3xl font-black text-white mt-1">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* --- Aggregated Reports Grid (NEW) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                
                {/* 🏆 Top Rated Titles */}
                <div>
                  <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="text-yellow-500">🏆</span> Top Rated Titles
                  </h3>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden shadow-lg">
                    {adminData?.reports?.topRated?.length === 0 ? (
                      <p className="p-8 text-gray-500 text-center">No ratings available yet.</p>
                    ) : (
                      adminData?.reports?.topRated?.map((media: any, idx: number) => (
                        <div key={media.id} className={`p-4 flex justify-between items-center hover:bg-white/5 transition-colors ${idx !== adminData.reports.topRated.length - 1 ? 'border-b border-white/5' : ''}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center font-bold text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-white truncate max-w-[180px] sm:max-w-[250px]">{media.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{media.reviewCount} Reviews • {media.viewCount} Views</p>
                            </div>
                          </div>
                          <div className="text-right bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
                            <p className="text-yellow-500 font-extrabold text-lg">★ {media.avgRating}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 🔥 Most Reviewed Titles */}
                <div>
                  <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                    <span className="text-blue-500">🔥</span> Most Reviewed Titles
                  </h3>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden shadow-lg">
                    {adminData?.reports?.mostReviewed?.length === 0 ? (
                      <p className="p-8 text-gray-500 text-center">No reviews available yet.</p>
                    ) : (
                      adminData?.reports?.mostReviewed?.map((media: any, idx: number) => (
                        <div key={media.id} className={`p-4 flex justify-between items-center hover:bg-white/5 transition-colors ${idx !== adminData.reports.mostReviewed.length - 1 ? 'border-b border-white/5' : ''}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-white truncate max-w-[180px] sm:max-w-[250px]">{media.title}</p>
                              <p className="text-xs text-gray-400 mt-1">★ {media.avgRating} Average Rating</p>
                            </div>
                          </div>
                          <div className="text-right bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                            <p className="text-blue-500 font-extrabold text-lg">{media.reviewCount}</p>
                            <p className="text-[10px] text-blue-400/70 font-bold uppercase tracking-wider">Reviews</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      )}

      {/* --- TAB 2: ADD/EDIT MEDIA --- */}
      {activeTab === 'add-media' && (
        <form onSubmit={handleMediaSubmit} className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleMediaChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Release Year</label>
                <input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleMediaChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Director</label>
                <input type="text" name="director" value={formData.director} onChange={handleMediaChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Genre (Comma separated)</label>
                <input type="text" name="genre" value={formData.genre} onChange={handleMediaChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cast (Comma separated)</label>
                <input type="text" name="cast" value={formData.cast} onChange={handleMediaChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Platforms (Comma separated)</label>
                <input type="text" name="streamingPlatform" value={formData.streamingPlatform} onChange={handleMediaChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Streaming Link (YouTube)</label>
                <input type="url" name="streamingLink" value={formData.streamingLink} onChange={handleMediaChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Poster URL</label>
                <input type="url" name="posterUrl" value={formData.posterUrl} onChange={handleMediaChange} placeholder="https://example.com/poster.jpg" className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Price Type</label>
                <select name="priceType" value={formData.priceType} onChange={handleMediaChange} className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 cursor-pointer">
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              
              {/* --- Editor's Pick Toggle --- */}
              <div className="flex items-center justify-between bg-[#222] px-4 py-3 rounded border border-white/5 mt-2">
                <div>
                  <p className="text-white font-bold text-sm">Editor's Pick (Featured)</p>
                  <p className="text-gray-400 text-xs mt-0.5">Show this in Hero Section & Editor's Picks</p>
                </div>
                <button 
                  type="button"
                  onClick={handleToggleFeatured}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${formData.isFeatured ? 'bg-red-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${formData.isFeatured ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>

            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Synopsis</label>
            <textarea name="synopsis" value={formData.synopsis} onChange={handleMediaChange} rows={4} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 resize-none"></textarea>
          </div>

          <div className="flex justify-end pt-4 gap-4">
            {editId && (
              <button 
                type="button" 
                onClick={() => { setActiveTab('manage-media'); setEditId(null); }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
              >
                Cancel Edit
              </button>
            )}
            <button type="submit" disabled={isAdding} className="px-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors shadow-[0_0_15px_rgba(229,9,20,0.4)]">
              {isAdding ? (editId ? 'Updating...' : 'Publishing...') : (editId ? 'Update Media' : 'Publish Media')}
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 3: MANAGE MEDIA LIST (NEW) --- */}
      {activeTab === 'manage-media' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {isLoadingMedia ? (
            <div className="text-center py-10 text-gray-400">Loading media library...</div>
          ) : mediaList.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-[#1a1a1a] rounded-xl border border-white/5">
              <span className="text-4xl block mb-3">🎬</span>
              <p>No media found in the library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaList.map((media: any) => (
                <div key={media.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <img
                      src={media.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop"}
                      alt={media.title}
                      className="w-16 h-24 rounded-lg object-cover border border-white/10 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white truncate text-lg">{media.title}</h4>
                        {media.isFeatured && <span className="bg-red-600/20 text-red-500 text-[10px] px-2 py-0.5 rounded uppercase font-bold border border-red-500/20">Featured</span>}
                      </div>
                      <p className="text-xs text-gray-400 flex gap-2">
                        <span>{media.releaseYear}</span> • 
                        <span className={media.priceType === 'PREMIUM' ? 'text-yellow-500' : 'text-green-500'}>{media.priceType}</span> • 
                        <span>👁️ {media.viewCount}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-1">
                        {media.posterUrl || 'No poster URL saved'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditMediaClick(media)}
                      className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/30 px-3 py-1.5 rounded text-sm font-bold transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteMedia(media.id)}
                      className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 px-3 py-1.5 rounded text-sm font-bold transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 4: MANAGE REVIEWS --- */}
      {activeTab === 'manage-reviews' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {isLoadingStats ? (
            <div className="text-center py-10 text-gray-400">Loading pending reviews...</div>
          ) : adminData?.pendingReviews?.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-[#1a1a1a] rounded-xl border border-white/5">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
              <h3 className="text-xl font-bold text-white mb-1">All caught up!</h3>
              <p>No pending reviews to approve.</p>
            </div>
          ) : (
            adminData?.pendingReviews?.map((review: any) => (
              <div key={review.id} className="bg-[#1a1a1a] p-5 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-white/20 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-600/20 text-red-500 px-2 py-0.5 rounded text-xs font-bold uppercase border border-red-500/20">{review.media.title}</span>
                    <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold">★ {review.rating}/10</span>
                  </div>
                  <p className="text-gray-200 font-medium mb-2 italic">"{review.content}"</p>
                  <p className="text-xs text-gray-500">
                    By <strong className="text-gray-400">{review.user.name}</strong> • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto shrink-0">
                  <button 
                    onClick={() => handleDeleteReview(review.id)}
                    className="flex-1 md:flex-none bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 px-4 py-2 rounded text-sm font-bold transition-all"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => handleApproveReview(review.id)}
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm font-bold transition-all shadow-[0_0_15px_rgba(22,163,7,0.4)]"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
