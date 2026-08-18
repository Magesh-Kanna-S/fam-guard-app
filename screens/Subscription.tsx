
import React from 'react';
import { UserProfile } from '../types';

interface SubscriptionProps {
  profile: UserProfile;
  onUpdate: (tier: UserProfile['subscription']) => void;
}

const tiers = [
  {
    id: 'Basic' as const,
    name: 'FAM-GUARD Basic',
    price: '₹0',
    period: 'Forever',
    tagline: 'For single-zone households',
    features: [
      '1 storage zone',
      'Real-time sensor dashboard',
      'Daily SMS alerts (severity: ACTION only)',
      'Manual ventilation toggle',
      '7-day history',
      'Community advisory articles',
    ],
    accent: 'bg-stone-100 dark:bg-stone-800',
    accentText: 'text-stone-700 dark:text-stone-200',
    border: 'border-stone-200 dark:border-stone-700',
    priceColor: 'text-stone-900 dark:text-white',
    icon: 'fa-seedling',
    iconBg: 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200',
  },
  {
    id: 'Plus' as const,
    name: 'FAM-GUARD Plus',
    price: '₹79',
    period: 'per month',
    tagline: 'For small-holder multi-zone farms',
    features: [
      'Up to 6 storage zones',
      'Auto-adaptive ventilation',
      'All severity alerts via SMS + Push',
      '30-day history & trends',
      'AI Advisory Chat (50 msgs/mo)',
      'Inventory & lot tracking',
      'Family/farm member access (up to 4)',
    ],
    accent: 'bg-[var(--color-brand-forest)]',
    accentText: 'text-white',
    border: 'border-[var(--color-brand-leaf)]',
    priceColor: 'text-white',
    icon: 'fa-wheat-awn',
    iconBg: 'bg-amber-400 text-stone-900',
    recommended: true,
  },
  {
    id: 'Pro' as const,
    name: 'FAM-GUARD Pro',
    price: '₹199',
    period: 'per month',
    tagline: 'For cooperatives & FPOs',
    features: [
      'Unlimited zones + multiple devices',
      'Predictive spoilage AI',
      'Unlimited AI Advisory Chat',
      '1-year history + exportable reports',
      'Weather-integrated ventilation scheduler',
      'KVK / TNAU officer integration',
      'Priority SMS + IVR call alerts',
      'Up to 20 farm members',
    ],
    accent: 'bg-stone-900 dark:bg-stone-950',
    accentText: 'text-white',
    border: 'border-stone-900 dark:border-stone-100',
    priceColor: 'text-white',
    icon: 'fa-crown',
    iconBg: 'bg-amber-400 text-stone-900',
  },
];

const Subscription: React.FC<SubscriptionProps> = ({ profile, onUpdate }) => {
  return (
    <div className="space-y-8 max-w-screen-xl mx-auto pb-10 text-stone-900 dark:text-stone-100">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <span className="inline-block bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
          FAM-GUARD Plans
        </span>
        <h3 className="text-4xl md:text-5xl font-black tracking-tight">Smarter Storage, Safer Grain</h3>
        <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium">
          Upgrade to unlock auto-adaptive ventilation, predictive alerts, and direct AI advisory — built for Indian small-holder farms.
        </p>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        {tiers.map(tier => {
          const isCurrent = profile.subscription === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => onUpdate(tier.id)}
              className={`p-8 rounded-[2.5rem] border-4 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full shadow-xl hover:shadow-2xl active:scale-[0.98] ${
                isCurrent ? `${tier.border} ring-8 ring-emerald-500/10` : `${tier.border} opacity-90 hover:opacity-100`
              } ${tier.accent} ${tier.accentText}`}
            >
              {tier.recommended && (
                <div className="absolute top-4 right-4">
                  <span className="bg-amber-400 text-stone-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    <i className="fa-solid fa-star mr-1"></i>Recommended
                  </span>
                </div>
              )}

              <div className="relative z-10 flex justify-between items-start mb-8">
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${tier.iconBg} flex items-center justify-center mb-3 shadow-lg`}>
                    <i className={`fa-solid ${tier.icon} text-2xl`}></i>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-wider mb-1">{tier.name}</h4>
                  <p className={`text-[10px] font-bold opacity-70`}>{tier.tagline}</p>
                </div>
              </div>

              <div className="relative z-10 mb-6">
                <div className="flex items-baseline gap-1">
                  <p className="text-5xl font-black tracking-tighter">{tier.price}</p>
                  <p className="text-xs font-bold opacity-70 tracking-wide uppercase">{tier.period}</p>
                </div>
              </div>

              <ul className="space-y-3 relative z-10 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="text-xs flex items-start gap-3 font-bold">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${tier.id === 'Basic' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-white/20 text-white'}`}>
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`mt-8 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${
                isCurrent
                  ? 'bg-emerald-400 text-white cursor-default'
                  : tier.id === 'Basic'
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200'
                    : 'bg-white text-stone-900 hover:bg-stone-100'
              }`}>
                {isCurrent ? '✓ Current Plan' : 'Select Plan'}
              </button>

              {tier.id === 'Pro' && (
                <i className="fa-solid fa-crown absolute -right-12 -bottom-12 text-white/5 text-[18rem] pointer-events-none"></i>
              )}
              {tier.id === 'Plus' && (
                <i className="fa-solid fa-wheat-awn absolute -right-8 -top-8 text-white/5 text-[15rem] pointer-events-none"></i>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-xl"></i>
          </div>
          <div>
            <p className="font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest text-xs">Secure UPI / Card Payments</p>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Powered by Razorpay · GST invoice included</p>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <i className="fa-brands fa-cc-visa text-3xl text-amber-800/30 dark:text-amber-400/30"></i>
          <i className="fa-brands fa-cc-mastercard text-3xl text-amber-800/30 dark:text-amber-400/30"></i>
          <i className="fa-solid fa-indian-rupee-sign text-3xl text-amber-800/30 dark:text-amber-400/30"></i>
          <span className="font-black text-2xl text-amber-800/30 dark:text-amber-400/30">UPI</span>
        </div>
      </div>

      {/* IVP Voucher notice */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 p-6 rounded-[2rem] text-center">
        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
          <i className="fa-solid fa-certificate mr-2"></i>
          Students & IVP Voucher-A grantees receive <span className="font-black">FAM-GUARD Plus free for 6 months</span>. Eligibility auto-detected on plan activation.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
