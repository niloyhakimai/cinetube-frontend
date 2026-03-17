"use client";

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('add-media');
  
  // States for Add Media
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '', synopsis: '', genre: '', releaseYear: '', 
    director: '', cast: '', streamingPlatform: '', priceType: 'FREE', streamingLink: '',
  });

  // States for Pending Reviews
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Fetch pending reviews when the tab changes
  useEffect(() => {
    if (activeTab === 'manage-reviews') {
      fetchPendingReviews();
    }
  }, [activeTab]);

  const fetchPendingReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await api.get('/reviews/admin/pending');
      setPendingReviews(response.data.reviews);
    } catch (error) {
      toast.error('Failed to load pending reviews');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await api.put(`/reviews/${reviewId}/approve`);
      toast.success('Review approved successfully!');
      // Remove the approved review from the list
      setPendingReviews(pendingReviews.filter(r => r.id !== reviewId));
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await api.post('/media', formattedData);
      toast.success('Media added successfully!');
      setFormData({
        title: '', synopsis: '', genre: '', releaseYear: '', director: '', 
        cast: '', streamingPlatform: '', priceType: 'FREE', streamingLink: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add media');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-[#111] p-8 rounded-xl border border-white/10 shadow-2xl">
      <Toaster position="top-right" />
      
      {/* Tabs Navigation */}
      <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('add-media')}
          className={`px-4 py-2 font-bold rounded transition-colors ${activeTab === 'add-media' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Add Media
        </button>
        <button 
          onClick={() => setActiveTab('manage-reviews')}
          className={`px-4 py-2 font-bold rounded transition-colors ${activeTab === 'manage-reviews' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Manage Reviews
          {pendingReviews.length > 0 && activeTab !== 'manage-reviews' && (
            <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">New</span>
          )}
        </button>
      </div>

      {/* Add Media Tab Content */}
      {activeTab === 'add-media' && (
        <form onSubmit={handleMediaSubmit} className="space-y-6">
          {/* ... Keep the exact same form fields from previous step here ... */}
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Price Type</label>
                <select name="priceType" value={formData.priceType} onChange={handleMediaChange} className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 cursor-pointer">
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Synopsis</label>
            <textarea name="synopsis" value={formData.synopsis} onChange={handleMediaChange} rows={4} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 resize-none"></textarea>
          </div>

          <button type="submit" disabled={isAdding} className="px-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors mt-4">
            {isAdding ? 'Adding...' : 'Publish Media'}
          </button>
        </form>
      )}

      {/* Manage Reviews Tab Content */}
      {activeTab === 'manage-reviews' && (
        <div className="space-y-6">
          {isLoadingReviews ? (
            <div className="text-center py-10 text-gray-400 animate-pulse">Loading pending reviews...</div>
          ) : pendingReviews.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-[#222] rounded-lg border border-white/5">
              No pending reviews. Everything is up to date!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingReviews.map((review) => (
                <div key={review.id} className="bg-[#222] p-5 rounded-lg border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-600/20 text-red-500 px-2 py-0.5 rounded text-xs font-bold uppercase">Movie: {review.media.title}</span>
                      <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold">★ {review.rating}/10</span>
                    </div>
                    <p className="text-white font-medium mb-1">"{review.content}"</p>
                    <p className="text-xs text-gray-500">By: {review.user.name} ({review.user.email}) - {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleApproveReview(review.id)}
                    className="shrink-0 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-bold transition-colors shadow-lg"
                  >
                    Approve Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}