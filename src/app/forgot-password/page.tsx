"use client";

import axios from 'axios';
import Link from 'next/link';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success(response.data.message || 'Reset link sent if the account exists.');
      setIsSubmitted(true);
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-10 bg-black/70 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] mt-10">
        <h2 className="text-3xl font-bold text-white mb-3">Forgot Password</h2>
        <p className="text-gray-400 text-sm leading-6 mb-8">
          Enter the email address linked to your CineTube account and we will send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email Address"
              className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder-gray-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 rounded transition-colors mt-4 shadow-[0_0_15px_rgba(229,9,20,0.4)] flex justify-center items-center"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {isSubmitted && (
          <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            Check your inbox for the password reset link. If the email exists, the message will arrive shortly.
          </div>
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
