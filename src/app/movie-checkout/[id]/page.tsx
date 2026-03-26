"use client";

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/payment/CheckoutForm';
import { api } from '@/lib/axios';
import { Toaster } from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function MovieCheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  const purchaseType = searchParams.get('type') || 'BUY'; 
  const router = useRouter();
  
  const [clientSecret, setClientSecret] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const price = purchaseType === 'RENT' ? '$3.99' : '$9.99';
  const title = purchaseType === 'RENT' ? 'Rent Movie (48 Hours)' : 'Buy Movie (Lifetime)';

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await api.post('/payments/create-intent', { 
          mediaId: id, 
          purchaseType 
        });
        setClientSecret(response.data.clientSecret);
        setPurchaseId(response.data.purchaseId);
      } catch (error: any) {
        console.error("Payment Error:", error);
        alert(error.response?.data?.message || "Failed to initialize payment");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (id) createPaymentIntent();
  }, [id, purchaseType, router]);

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
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      
      <div className="relative z-10 max-w-lg w-full p-10 bg-[#111]/90 border border-white/10 rounded-xl shadow-[0_0_50px_rgba(229,9,20,0.1)] backdrop-blur-md">
        
        <div className="text-center mb-8">
          <span className="bg-red-600/20 text-red-500 font-bold px-3 py-1 rounded-full text-sm uppercase tracking-wider mb-4 inline-block">Secure Checkout</span>
          <h1 className="text-3xl font-extrabold mb-2 text-white">{title}</h1>
          <p className="text-gray-400">{purchaseType === 'RENT' ? 'Watch instantly for the next 48 hours.' : 'Add this movie to your lifetime library.'}</p>
        </div>
        
        <div className="bg-[#0a0a0a] p-5 rounded-lg border border-white/5 mb-6 flex justify-between items-center">
          <span className="font-semibold text-gray-300">Total Amount:</span>
          <span className="text-2xl font-bold text-red-500">{price}</span>
        </div>
        
        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <CheckoutForm 
              clientSecret={clientSecret} 
              purchaseId={purchaseId}
              mediaId={id as string}
              price={price} 
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

function MovieCheckoutFallback() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function MovieCheckoutPage() {
  return (
    <Suspense fallback={<MovieCheckoutFallback />}>
      <MovieCheckoutContent />
    </Suspense>
  );
}
