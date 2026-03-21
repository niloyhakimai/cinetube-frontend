"use client";

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionFormProps {
  clientSecret: string;
  planName: string;
  price: string;
  subscriptionId?: string;
}

export default function SubscriptionForm({ clientSecret, planName, price, subscriptionId }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

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
      
      try {
        const planType = planName.toLowerCase().includes('yearly') ? 'yearly' : 'monthly';

        const response = await api.post('/subscriptions/confirm', {
          planId: planType,
          subscriptionId,
        });

        toast.success(
          () => (
            <span>
              <b>Payment Successful!</b> <br />
              Your account has been upgraded to PRO. 🚀
            </span>
          ),
          { duration: 5000 }
        );

        if (response.data?.user) {
          updateUser(response.data.user);
        }

        setTimeout(() => {
          window.location.href = '/profile';
        }, 2000);

      } catch (err) {
        console.error("Failed to update database:", err);
        toast.error("Payment succeeded, but failed to update profile.");
        setIsProcessing(false);
      }
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
