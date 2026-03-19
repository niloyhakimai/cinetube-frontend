"use client";

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface SubscriptionFormProps {
  clientSecret: string;
  planName: string;
  price: string;
}

export default function SubscriptionForm({ clientSecret, planName, price }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    // Confirm the subscription payment intent
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      console.error("Stripe Error:", error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success(`Welcome to ${planName}! Your subscription is now active.`);
      
      // Update local storage user data slightly so the frontend knows they are premium
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.subscriptionPlan = planName.includes('Yearly') ? 'YEARLY' : 'MONTHLY';
      localStorage.setItem('user', JSON.stringify(storedUser));

      // Redirect to profile or home
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="p-4 bg-[#222] border border-white/10 rounded-md">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': { color: '#888888' },
                iconColor: '#e50914',
              },
              invalid: { color: '#ef4444', iconColor: '#ef4444' },
            },
            hidePostalCode: true,
          }} 
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 rounded transition-colors shadow-[0_0_15px_rgba(229,9,20,0.4)]"
      >
        {isProcessing ? 'Processing Secure Payment...' : `Subscribe for ${price}`}
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        Payments are securely processed by Stripe. You can cancel your subscription at any time from your profile.
      </p>
    </form>
  );
}