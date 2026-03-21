"use client";

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import SubscriptionForm from '@/components/payment/SubscriptionForm';
import { api } from '@/lib/axios';
import { Toaster } from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function SubscribePage() {
  const params = useParams();
  const { planId } = params;
  const router = useRouter();
  
  const [clientSecret, setClientSecret] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Define plan details for the UI based on the URL parameter
  const planDetails = {
    monthly: { name: 'Premium Monthly', price: '$9.99/month' },
    yearly: { name: 'Premium Yearly', price: '$99.99/year' }
  };

  const currentPlan = planDetails[planId as keyof typeof planDetails];

  useEffect(() => {
    if (!currentPlan) {
      router.push('/'); // Redirect if invalid plan
      return;
    }

    const createSubscription = async () => {
      try {
        const response = await api.post('/subscriptions/create-intent', { planId });
        setClientSecret(response.data.clientSecret);
        setSubscriptionId(response.data.subscriptionId || '');
      } catch (error: unknown) {
        const message = axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined;

        console.error("Subscription Error:", error);
        alert(message || "Failed to initialize subscription");
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    createSubscription();
  }, [planId, router, currentPlan]);

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
          <span className="bg-red-600/20 text-red-500 font-bold px-3 py-1 rounded-full text-sm uppercase tracking-wider mb-4 inline-block">Upgrade Account</span>
          <h1 className="text-3xl font-extrabold mb-2 text-white">{currentPlan.name}</h1>
          <p className="text-gray-400">Unlock the ultimate streaming experience.</p>
        </div>
        
        <div className="bg-[#0a0a0a] p-5 rounded-lg border border-white/5 mb-6 flex justify-between items-center">
          <span className="font-semibold text-gray-300">Total Amount:</span>
          <span className="text-2xl font-bold text-red-500">{currentPlan.price}</span>
        </div>

        {/* Features Checklist */}
        <div className="mb-6 space-y-2">
          {['Ad-free streaming', '4K Ultra HD quality', 'Cancel anytime'].map((feature, i) => (
            <div key={i} className="flex items-center text-sm text-gray-400">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {feature}
            </div>
          ))}
        </div>
        
        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
            <SubscriptionForm 
              clientSecret={clientSecret} 
              subscriptionId={subscriptionId}
              planName={currentPlan.name} 
              price={currentPlan.price} 
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
