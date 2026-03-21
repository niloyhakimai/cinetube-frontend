"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const plans = [
  {
    name: "Free",
    price: "$0",
    duration: "/forever",
    features: ["Access to free movies", "Standard definition (SD)", "Ads included", "Read community reviews"],
    buttonText: "Current Plan",
    buttonClasses: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    isPopular: false,
    planId: "free"
  },
  {
    name: "Premium Monthly",
    price: "$9.99",
    duration: "/month",
    features: ["Access to ALL premium content", "4K Ultra HD quality", "Ad-free experience", "Download for offline viewing"],
    buttonText: "Subscribe Now",
    buttonClasses: "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]",
    isPopular: true,
    planId: "monthly"
  },
  {
    name: "Premium Yearly",
    price: "$99.99",
    duration: "/year",
    features: ["Everything in Monthly", "Save 16% annually", "Priority customer support", "Exclusive early access"],
    buttonText: "Save 16% Now",
    buttonClasses: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    isPopular: false,
    planId: "yearly"
  }
];

export default function Pricing() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Hydration error 
  if (!mounted) return null;


  if (user && user.subscriptionStatus === 'ACTIVE') {
    return null; 
  }

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Choose Your Plan</h2>
        <p className="text-gray-400 text-lg">
          Unlock the full CineTube experience. Upgrade to Premium for ad-free streaming and exclusive 4K content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative flex flex-col p-8 rounded-2xl backdrop-blur-xl border ${plan.isPopular ? 'bg-red-950/20 border-red-500/50 scale-105 z-10' : 'bg-[#111] border-white/10'} transition-transform duration-300 hover:scale-105`}>
            
            {plan.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-white">{plan.price}</span>
              <span className="text-gray-400 text-sm">{plan.duration}</span>
            </div>
            
            <ul className="flex-1 space-y-4 mb-8 text-sm text-gray-300">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link 
              href={user ? `/subscribe/${plan.planId}` : '/login'} 
              className={`w-full py-3 rounded-lg font-bold text-center transition-all ${plan.buttonClasses}`}
            >
              {plan.buttonText}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
