"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/payment/CheckoutForm';
import { api } from '@/lib/axios';
import { Toaster } from 'react-hot-toast';

// Initialize Stripe outside of component render to avoid recreating the object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  
  const [clientSecret, setClientSecret] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createIntent = async () => {
      try {
        // Call our backend to create a payment intent
        const response = await api.post('/payments/create-intent', { mediaId: id });
        setClientSecret(response.data.clientSecret);
        setPurchaseId(response.data.purchaseId);
      } catch (error: any) {
        console.error("Payment Intent Error:", error);
        alert(error.response?.data?.message || "Failed to initialize payment");
        router.push(`/movies/${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) createIntent();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white pt-20 pb-10">
      <Toaster position="top-center" />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-lg w-full p-10 bg-[#111]/90 border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2 text-white">Premium Access</h1>
          <p className="text-gray-400">Unlock this exclusive content instantly.</p>
        </div>
        
        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-white/5 mb-6 flex justify-between items-center">
          <span className="font-semibold text-gray-300">Total Amount:</span>
          <span className="text-2xl font-bold text-red-500">$9.99</span>
        </div>
        
        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <CheckoutForm 
              clientSecret={clientSecret} 
              purchaseId={purchaseId} 
              mediaId={id as string} 
            />
          </Elements>
        )}
      </div>
    </div>
  );
}