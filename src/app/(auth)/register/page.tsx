"use client";

import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      toast.success(response.data.message || 'Registration successful!');
      
      // Redirect to login page after brief delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-10 bg-black/70 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] mt-10">
        <h2 className="text-3xl font-bold text-white mb-8">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name" 
              className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder-gray-500"
              required
            />
          </div>
          <div>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address" 
              className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder-gray-500"
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password" 
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
            {isLoading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="grow border-t border-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="grow border-t border-gray-600"></div>
        </div>

        {/* Note: Google Login will be implemented later */}
        <button 
          type="button"
          onClick={() => toast.success('Google Login coming soon!')}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black font-bold py-3 rounded transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-gray-400 text-sm mt-8 text-center">
          Already have an account? <Link href="/login" className="text-white hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
