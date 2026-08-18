
import React from 'react';

interface WelcomeProps {
  onContinue: () => void;
  userName?: string;
  zonesCount?: number;
}

const Welcome: React.FC<WelcomeProps> = ({ onContinue, userName, zonesCount = 4 }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A2E] via-[#2F6F4E] to-[#1B3A2E] flex flex-col items-center justify-center p-8 text-white text-center space-y-8 animate-in slide-in-from-bottom duration-500 relative overflow-hidden">
      <i className="fa-solid fa-warehouse absolute -top-10 -right-10 text-white/5 text-[20rem] rotate-12 pointer-events-none"></i>
      <i className="fa-solid fa-shield-halved absolute -bottom-10 -left-10 text-white/5 text-[18rem] -rotate-12 pointer-events-none"></i>

      <div className="w-20 h-20 bg-amber-400/20 rounded-3xl flex items-center justify-center backdrop-blur-lg border border-amber-300/30">
        <i className="fa-solid fa-hand-sparkles text-3xl text-amber-200"></i>
      </div>

      <div className="space-y-4 relative z-10">
        <h2 className="text-4xl font-black">Welcome, {userName || 'Farmer'}!</h2>
        <p className="text-emerald-100 font-medium leading-relaxed max-w-xs mx-auto">
          Your FAM-GUARD device is online. We have synced {zonesCount} storage zones and started monitoring your grain in real time.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-left flex gap-4 items-center">
          <i className="fa-solid fa-circle-check text-emerald-300"></i>
          <p className="text-xs font-bold">Device paired · FAM-GUARD-01</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-left flex gap-4 items-center">
          <i className="fa-solid fa-circle-check text-emerald-300"></i>
          <p className="text-xs font-bold">Sensors calibrated · 4 zones ready</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-left flex gap-4 items-center">
          <i className="fa-solid fa-circle-check text-emerald-300"></i>
          <p className="text-xs font-bold">SMS alerts enabled on your phone</p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-xs py-5 bg-amber-400 text-stone-900 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:bg-amber-300"
      >
        Enter Dashboard
      </button>
    </div>
  );
};

export default Welcome;
