"use client";

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

interface SubscriptionFormProps {
  clientSecret: string;
  planName: string;
  price: string;
}

export default function SubscriptionForm({ clientSecret, planName, price }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
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
      // সাকসেস মেসেজ একটু ডিটেইলস দাও
      toast.success(
        (t) => (
          <span>
            <b>Payment Successful!</b> <br />
            We've sent a confirmation email to your inbox. 📧
          </span>
        ),
        { duration: 6000 }
      );
      
      // Local storage আপডেট
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.subscriptionPlan = planName.includes('Yearly') ? 'YEARLY' : 'MONTHLY';
      storedUser.subscriptionStatus = 'ACTIVE';
      localStorage.setItem('user', JSON.stringify(storedUser));

      setTimeout(() => {
        window.location.href = '/profile';
      }, 3000);
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