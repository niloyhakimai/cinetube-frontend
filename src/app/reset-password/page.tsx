"use client";

import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error('This reset link is missing or invalid.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
      });

      toast.success(response.data.message || 'Password reset successful.');

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-10 bg-black/70 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] mt-10">
        <h2 className="text-3xl font-bold text-white mb-3">Set New Password</h2>
        <p className="text-gray-400 text-sm leading-6 mb-8">
          Create a new password for your CineTube account.
        </p>

        {!token ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            This reset link is invalid or incomplete.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New Password"
                className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder-gray-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm New Password"
                className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder-gray-500"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 rounded transition-colors mt-4 shadow-[0_0_15px_rgba(229,9,20,0.4)] flex justify-center items-center"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm">
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
