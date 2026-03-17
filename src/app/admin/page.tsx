"use client";

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    genre: '',
    releaseYear: '',
    director: '',
    cast: '',
    streamingPlatform: '',
    priceType: 'FREE',
    streamingLink: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Format arrays and numbers for the backend
    const formattedData = {
      ...formData,
      releaseYear: parseInt(formData.releaseYear),
      genre: formData.genre.split(',').map((item) => item.trim()),
      cast: formData.cast.split(',').map((item) => item.trim()),
      streamingPlatform: formData.streamingPlatform.split(',').map((item) => item.trim()),
    };

    try {
      await api.post('/media', formattedData);
      toast.success('Media added successfully to the library!');
      
      // Reset form after successful submission
      setFormData({
        title: '', synopsis: '', genre: '', releaseYear: '', director: '', 
        cast: '', streamingPlatform: '', priceType: 'FREE', streamingLink: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add media. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111] p-8 rounded-xl border border-white/10 shadow-2xl">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-6 text-red-500">Add New Movie / Series</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Release Year</label>
              <input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Director</label>
              <input type="text" name="director" value={formData.director} onChange={handleChange} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Genre (Comma separated)</label>
              <input type="text" name="genre" value={formData.genre} onChange={handleChange} placeholder="e.g. Action, Sci-Fi, Drama" required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cast (Comma separated)</label>
              <input type="text" name="cast" value={formData.cast} onChange={handleChange} placeholder="e.g. Tom Hardy, Cillian Murphy" required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Platforms (Comma separated)</label>
              <input type="text" name="streamingPlatform" value={formData.streamingPlatform} onChange={handleChange} placeholder="e.g. Netflix, Amazon Prime" required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Streaming Link (YouTube)</label>
              <input type="url" name="streamingLink" value={formData.streamingLink} onChange={handleChange} placeholder="https://youtube.com/..." required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Price Type</label>
              <select name="priceType" value={formData.priceType} onChange={handleChange} className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all cursor-pointer">
                <option value="FREE">Free</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Full Width Synopsis */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Synopsis</label>
          <textarea name="synopsis" value={formData.synopsis} onChange={handleChange} rows={4} required className="w-full bg-[#222] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-transparent focus:border-red-600 transition-all resize-none"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full md:w-auto px-8 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 rounded transition-colors mt-4 shadow-[0_0_15px_rgba(229,9,20,0.4)]"
        >
          {isLoading ? 'Adding Media...' : 'Publish Media'}
        </button>
      </form>
    </div>
  );
}