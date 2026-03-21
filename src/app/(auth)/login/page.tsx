"use client";

import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
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
      const response = await api.post('/auth/login', formData);
      toast.success('Logged in successfully!');
      login(response.data.token, response.data.user);

      // Redirect to home page
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-10 bg-black/70 border border-white/10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] mt-10">
        <h2 className="text-3xl font-bold text-white mb-8">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
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
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 rounded transition-colors mt-4 shadow-[0_0_15px_rgba(229,9,20,0.4)] flex justify-center items-center"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="grow border-t border-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="grow border-t border-gray-600"></div>
        </div>

        {/* Google Login Component */}
        <div className="flex justify-center w-full">
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await api.post('/auth/google', {
                    credential: credentialResponse.credential,
                  });
                  login(res.data.token, res.data.user);
                  
                  toast.success('Successfully logged in with Google!');
                  
                  setTimeout(() => {
                    router.push('/');
                  }, 1000);
                  
                } catch (error) {
                  console.error("Google Login Error:", error);
                  toast.error('Google Login failed. Please try again.');
                }
              }}
              onError={() => {
                toast.error('Google authentication failed');
              }}
              theme="filled_black"
              shape="rectangular"
              size="large"
              width="100%"
              text="continue_with"
            />
          </GoogleOAuthProvider>
        </div>

        <div className="mt-8 flex flex-col space-y-2 text-center text-sm">
          <Link href="/forgot-password" className="text-gray-400 hover:text-white transition-colors">
            Forgot Password?
          </Link>
          <p className="text-gray-400">
            New to CineTube? <Link href="/register" className="text-white hover:underline font-medium">Sign up now.</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
