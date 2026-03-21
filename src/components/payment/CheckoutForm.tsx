"use client";

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';

interface CheckoutFormProps {
  clientSecret: string;
  purchaseId: string;
  mediaId: string;
  price: string;
}

export default function CheckoutForm({ clientSecret, purchaseId, mediaId, price }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      console.error("Stripe Error:", error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await api.post('/payments/confirm', { purchaseId });
        toast.success("Payment Successful! You can now watch the movie.", { duration: 5000 });
        setTimeout(() => {
          window.location.href = `/movies/${mediaId}`;
        }, 2000);
      } catch (err) {
        toast.error("Payment succeeded, but failed to confirm with server.");
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="p-4 bg-[#222] border border-white/10 rounded-md">
        <CardElement options={{
          style: { base: { fontSize: '16px', color: '#ffffff', '::placeholder': { color: '#888888' }, iconColor: '#e50914' }, invalid: { color: '#ef4444', iconColor: '#ef4444' } },
          hidePostalCode: true,
        }} />
      </div>
      <button type="submit" disabled={!stripe || isProcessing} className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 rounded transition-colors shadow-[0_0_15px_rgba(229,9,20,0.4)]">
        {isProcessing ? 'Processing...' : `Pay ${price}`}
      </button>
    </form>
  );
}