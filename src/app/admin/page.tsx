"use client";

import { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

type DashboardTab = 'overview' | 'add-media' | 'manage-media' | 'manage-reviews' | 'curation';

type DashboardResponse = {
  role: string;
  capabilities: string[];
  stats: {
    totalUsers: number;
    totalMedia: number;
    totalReviews: number;
    pendingReviewCount: number;
    activeUsers: number;
  };
  pendingReviews: Array<{
    id: string;
    rating: number;
    content: string;
    createdAt: string;
    user: { name: string; email: string };
    media: { title: string };
  }>;
  analytics: {
    revenueByMonth: Array<{ label: string; revenue: number; movieRevenue: number; subscriptionRevenue: number }>;
    reviewTrends: Array<{ label: string; approved: number; pending: number }>;
    subscriptionMix: Array<{ plan: string; count: number }>;
    featuredMedia: Array<{ id: string; title: string; avgRating: number; reviewCount: number; viewCount: number; mediaType: string }>;
  };
  reports: {
    topRated: Array<{ id: string; title: string; avgRating: number; reviewCount: number; viewCount: number; mediaType: string }>;
    mostReviewed: Array<{ id: string; title: string; avgRating: number; reviewCount: number; viewCount: number; mediaType: string }>;
  };
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
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
    posterUrl: '',
    isFeatured: false,
  });

  const role = user?.role || 'USER';
  const canViewAnalytics = role === 'ADMIN';
  const canManageMedia = role === 'ADMIN' || role === 'CURATOR';
  const canModerateReviews = role === 'ADMIN' || role === 'MODERATOR';
  const canCurate = role === 'ADMIN' || role === 'CURATOR';

  const availableTabs = useMemo(() => {
    const tabs: Array<{ id: DashboardTab; label: string }> = [];
    if (canViewAnalytics) tabs.push({ id: 'overview', label: 'Analytics' });
    if (canManageMedia) tabs.push({ id: 'add-media', label: editId ? 'Edit Media' : 'Add Media' });
    if (canManageMedia) tabs.push({ id: 'manage-media', label: 'Manage Media' });
    if (canModerateReviews) tabs.push({ id: 'manage-reviews', label: 'Moderate Reviews' });
    if (canCurate) tabs.push({ id: 'curation', label: 'Curation' });
    return tabs;
  }, [canCurate, canManageMedia, canModerateReviews, canViewAnalytics, editId]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [activeTab, availableTabs]);

  useEffect(() => {
    if (canViewAnalytics || canModerateReviews || canCurate) {
      fetchDashboard();
    }
    if (canManageMedia) {
      fetchMediaList();
    }
  }, [canCurate, canManageMedia, canModerateReviews, canViewAnalytics]);

  const fetchDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoadingDashboard(false);
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

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData((current) => ({ ...current, [target.name]: value }));
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      title: '',
      synopsis: '',
      genre: '',
      releaseYear: '',
      director: '',
      cast: '',
      streamingPlatform: '',
      priceType: 'FREE',
      streamingLink: '',
      posterUrl: '',
      isFeatured: false,
    });
  };

  const handleMediaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      releaseYear: Number(formData.releaseYear),
      genre: formData.genre.split(',').map((entry) => entry.trim()).filter(Boolean),
      cast: formData.cast.split(',').map((entry) => entry.trim()).filter(Boolean),
      streamingPlatform: formData.streamingPlatform.split(',').map((entry) => entry.trim()).filter(Boolean),
    };

    try {
      if (editId) {
        await api.put(`/media/${editId}`, payload);
        toast.success('Media updated successfully');
      } else {
        await api.post('/media', payload);
        toast.success('Media added successfully');
      }
      resetForm();
      fetchMediaList();
      fetchDashboard();
      setActiveTab(canManageMedia ? 'manage-media' : 'curation');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save media');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMedia = (media: any) => {
    setEditId(media.id);
    setFormData({
      title: media.title || '',
      synopsis: media.synopsis || '',
      genre: media.genre?.join(', ') || '',
      releaseYear: String(media.releaseYear || ''),
      director: media.director || '',
      cast: media.cast?.join(', ') || '',
      streamingPlatform: media.streamingPlatform?.join(', ') || '',
      priceType: media.priceType || 'FREE',
      streamingLink: media.streamingLink || '',
      posterUrl: media.posterUrl || '',
      isFeatured: media.isFeatured || false,
    });
    setActiveTab('add-media');
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm('Delete this media item permanently?')) {
      return;
    }

    try {
      await api.delete(`/media/${mediaId}`);
      toast.success('Media deleted');
      setMediaList((current) => current.filter((item) => item.id !== mediaId));
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await api.put(`/reviews/${reviewId}/approve`);
      toast.success('Review approved');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const maxRevenue = Math.max(...(dashboardData?.analytics.revenueByMonth.map((entry) => entry.revenue) || [1]));
  const maxReviewTrend = Math.max(...(dashboardData?.analytics.reviewTrends.flatMap((entry) => [entry.approved, entry.pending]) || [1]));

  return (
    <div className="surface-panel p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id === 'add-media' && !editId) {
                resetForm();
              }
              setActiveTab(tab.id);
            }}
            className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.id === 'manage-reviews' && (dashboardData?.stats.pendingReviewCount || 0) > 0 ? ` (${dashboardData?.stats.pendingReviewCount})` : ''}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && canViewAnalytics && (
        <div className="space-y-8">
          {isLoadingDashboard ? (
            <LoadingState label="Loading analytics..." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
                {[
                  { label: 'Total Users', value: dashboardData?.stats.totalUsers || 0 },
                  { label: 'Active Users', value: dashboardData?.stats.activeUsers || 0 },
                  { label: 'Media Titles', value: dashboardData?.stats.totalMedia || 0 },
                  { label: 'Approved Reviews', value: dashboardData?.stats.totalReviews || 0 },
                  { label: 'Pending Reviews', value: dashboardData?.stats.pendingReviewCount || 0 },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-red-400">{stat.label}</p>
                    <p className="mt-4 text-4xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-3xl border border-white/10 bg-[#171717] p-6">
                  <h3 className="text-xl font-bold text-white">Revenue by Month</h3>
                  <div className="mt-6 space-y-4">
                    {dashboardData?.analytics.revenueByMonth.map((entry) => (
                      <div key={entry.label}>
                        <div className="mb-2 flex items-center justify-between text-sm text-gray-300">
                          <span>{entry.label}</span>
                          <span>${entry.revenue.toFixed(2)}</span>
                        </div>
                        <div className="h-3 rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-red-600" style={{ width: `${(entry.revenue / maxRevenue) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#171717] p-6">
                  <h3 className="text-xl font-bold text-white">Review Trends</h3>
                  <div className="mt-6 space-y-5">
                    {dashboardData?.analytics.reviewTrends.map((entry) => (
                      <div key={entry.label}>
                        <div className="mb-2 flex items-center justify-between text-sm text-gray-300">
                          <span>{entry.label}</span>
                          <span>{entry.approved} approved / {entry.pending} pending</span>
                        </div>
                        <div className="grid gap-2">
                          <div className="h-2 rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-green-500" style={{ width: `${(entry.approved / maxReviewTrend) * 100}%` }} />
                          </div>
                          <div className="h-2 rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-yellow-500" style={{ width: `${(entry.pending / maxReviewTrend) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <PerformanceTable title="Top Rated Titles" items={dashboardData?.reports.topRated || []} />
                <PerformanceTable title="Most Reviewed Titles" items={dashboardData?.reports.mostReviewed || []} />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'add-media' && canManageMedia && (
        <form onSubmit={handleMediaSubmit} className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <InputField label="Title" name="title" value={formData.title} onChange={handleMediaChange} />
            <InputField label="Release Year" name="releaseYear" value={formData.releaseYear} onChange={handleMediaChange} type="number" />
            <InputField label="Director" name="director" value={formData.director} onChange={handleMediaChange} />
            <InputField label="Genre (comma separated)" name="genre" value={formData.genre} onChange={handleMediaChange} />
            <InputField label="Cast (comma separated)" name="cast" value={formData.cast} onChange={handleMediaChange} />
          </div>

          <div className="space-y-4">
            <InputField label="Platforms (comma separated)" name="streamingPlatform" value={formData.streamingPlatform} onChange={handleMediaChange} />
            <InputField label="Streaming Link" name="streamingLink" value={formData.streamingLink} onChange={handleMediaChange} type="url" />
            <InputField label="Poster URL" name="posterUrl" value={formData.posterUrl} onChange={handleMediaChange} type="url" />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">Price Type</label>
              <select name="priceType" value={formData.priceType} onChange={handleMediaChange} className="select-shell">
                <option value="FREE">Free</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <span>
                <span className="block font-bold text-white">Feature on homepage</span>
                <span className="mt-1 block text-sm text-gray-400">Use this for editor picks and hero-ready content.</span>
              </span>
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleMediaChange} className="h-4 w-4 accent-red-600" />
            </label>
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-400">Synopsis</label>
            <textarea name="synopsis" value={formData.synopsis} onChange={handleMediaChange} rows={5} className="textarea-shell" />
          </div>

          <div className="xl:col-span-2 flex justify-end gap-3">
            {editId && (
              <button type="button" onClick={resetForm} className="secondary-button">
                Cancel Edit
              </button>
            )}
            <button type="submit" disabled={isSubmitting} className="primary-button disabled:opacity-60">
              {isSubmitting ? 'Saving...' : editId ? 'Update Media' : 'Publish Media'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'manage-media' && canManageMedia && (
        <div>
          {isLoadingMedia ? (
            <LoadingState label="Loading media library..." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {mediaList.map((media) => (
                <div key={media.id} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#171717] p-4">
                  <img
                    src={media.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop'}
                    alt={media.title}
                    className="h-24 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-lg font-bold text-white">{media.title}</h3>
                      {media.isFeatured && (
                        <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-400">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      {media.releaseYear} • {media.priceType} • {media.viewCount} views
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEditMedia(media)} className="secondary-button !rounded-2xl !px-4 !py-2 text-sm">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteMedia(media.id)} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage-reviews' && canModerateReviews && (
        <div>
          {isLoadingDashboard ? (
            <LoadingState label="Loading moderation queue..." />
          ) : dashboardData?.pendingReviews.length ? (
            <div className="space-y-4">
              {dashboardData.pendingReviews.map((review) => (
                <div key={review.id} className="rounded-3xl border border-white/10 bg-[#171717] p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-3xl">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-red-400">
                          {review.media.title}
                        </span>
                        <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
                          {review.rating}/10
                        </span>
                      </div>
                      <p className="text-lg leading-8 text-white">“{review.content}”</p>
                      <p className="mt-3 text-sm text-gray-400">
                        By {review.user.name} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => handleDeleteReview(review.id)} className="secondary-button !rounded-2xl !px-4 !py-2 text-sm">
                        Delete
                      </button>
                      <button type="button" onClick={() => handleApproveReview(review.id)} className="primary-button !rounded-2xl !px-4 !py-2 text-sm">
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#171717] p-10 text-center">
              <h3 className="text-2xl font-bold text-white">All caught up</h3>
              <p className="mt-3 text-gray-400">No pending reviews are waiting for moderation right now.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'curation' && canCurate && (
        <div className="space-y-6">
          {isLoadingDashboard ? (
            <LoadingState label="Loading curation insights..." />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(dashboardData?.analytics.featuredMedia || []).slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-[#171717] p-5">
                    <p className="truncate font-bold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-gray-400">{item.mediaType} • {item.viewCount} views</p>
                    <p className="mt-4 text-sm text-yellow-400">★ {item.avgRating.toFixed(1)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#171717] p-6">
                <h3 className="text-xl font-bold text-white">Featured Titles Queue</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
                  Curators can use the media editor to toggle feature status and keep homepage storytelling fresh without touching analytics or moderation flows.
                </p>
                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                  {(dashboardData?.analytics.featuredMedia || []).map((item, index) => (
                    <div key={item.id} className={`flex items-center justify-between gap-4 px-5 py-4 ${index !== (dashboardData?.analytics.featuredMedia.length || 0) - 1 ? 'border-b border-white/10' : ''}`}>
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="text-sm text-gray-400">{item.reviewCount} reviews • {item.viewCount} views</p>
                      </div>
                      <button type="button" onClick={() => {
                        const media = mediaList.find((entry) => entry.id === item.id);
                        if (media) {
                          handleEditMedia(media);
                        }
                      }} className="secondary-button !rounded-2xl !px-4 !py-2 text-sm">
                        Update
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      {label}
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-400">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} className="input-shell" />
    </div>
  );
}

function PerformanceTable({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; avgRating: number; reviewCount: number; viewCount: number; mediaType: string }>;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#171717] p-6">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
        {items.map((item, index) => (
          <div key={item.id} className={`flex items-center justify-between gap-4 px-5 py-4 ${index !== items.length - 1 ? 'border-b border-white/10' : ''}`}>
            <div className="min-w-0">
              <p className="truncate font-bold text-white">{item.title}</p>
              <p className="text-sm text-gray-400">{item.mediaType} • {item.reviewCount} reviews • {item.viewCount} views</p>
            </div>
            <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-sm font-black text-yellow-400">
              ★ {item.avgRating}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
