
import React, { useState } from 'react';

interface LoginProps {
  onLoginComplete: (data: { method: 'Google' | 'Phone'; name: string; phone?: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginComplete }) => {
  const [phase, setPhase] = useState<'CHOICE' | 'PHONE_INPUT' | 'OTP_INPUT' | 'NAME_PROMPT'>('CHOICE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'Google' | 'Phone'>('Phone');

  const handleChoice = (m: 'Google' | 'Phone') => {
    setMethod(m);
    if (m === 'Phone') {
      setPhase('PHONE_INPUT');
    } else {
      setPhase('NAME_PROMPT');
    }
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber.length >= 10) {
      setPhase('OTP_INPUT');
    }
  };

  const handleOtpVerify = () => {
    if (otp === '1234') {
      setPhase('NAME_PROMPT');
    } else {
      alert('Invalid OTP. Try 1234');
    }
  };

  const handleFinalSubmit = () => {
    if (name.trim()) {
      onLoginComplete({ method, name, phone: phoneNumber });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A2E] via-[#2F6F4E] to-[#1B3A2E] flex flex-col items-center justify-between p-8 animate-in fade-in duration-700 relative overflow-hidden">
      {/* Decorative silo icons */}
      <i className="fa-solid fa-warehouse absolute top-20 left-8 text-white/5 text-[15rem] -rotate-12 pointer-events-none"></i>
      <i className="fa-solid fa-seedling absolute bottom-32 right-8 text-white/5 text-[12rem] rotate-12 pointer-events-none"></i>

      <div className="flex-1 flex flex-col items-center justify-center w-full space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-amber-900/30 relative">
            <i className="fa-solid fa-warehouse text-[var(--color-brand-grain)] text-5xl"></i>
            <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--color-brand-grain)] rounded-full flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-shield-halved text-xs"></i>
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">FAM-GUARD</h1>
          <p className="text-amber-200 font-bold tracking-wide text-sm uppercase">Protecting Every Grain, Empowering Every Home.</p>
          <p className="text-emerald-100/80 font-medium text-xs max-w-sm mx-auto">Smart grain storage companion for small-holder farmers and rural households.</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          {phase === 'CHOICE' && (
            <>
              <button
                onClick={() => handleChoice('Google')}
                className="w-full bg-white text-stone-800 py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-stone-100 transition-all active:scale-95 shadow-xl"
              >
                <i className="fa-brands fa-google text-red-500 text-lg"></i>
                <span className="font-bold">Continue with Google</span>
              </button>
              <button
                onClick={() => handleChoice('Phone')}
                className="w-full bg-[var(--color-brand-grain)] text-white py-4 rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-amber-900/30 active:scale-95 transition-all hover:bg-[var(--color-brand-amber)]"
              >
                <i className="fa-solid fa-phone text-lg"></i>
                <span className="font-bold">Login with Phone OTP</span>
              </button>
              <p className="text-center text-amber-100/70 text-[10px] font-medium pt-4">
                By logging in you agree to receive storage alerts via SMS and app notifications.
              </p>
            </>
          )}

          {phase === 'PHONE_INPUT' && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-amber-100 text-[10px] font-black uppercase tracking-widest mb-1">Registered Mobile</p>
                <p className="text-white text-xs font-bold">Used for SMS alerts when storage risk changes</p>
              </div>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input-field bg-white"
                maxLength={10}
              />
              <button
                onClick={handlePhoneSubmit}
                className="w-full bg-[var(--color-brand-grain)] text-white py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-amber-900/30 hover:bg-[var(--color-brand-amber)]"
              >
                Send OTP
              </button>
            </div>
          )}

          {phase === 'OTP_INPUT' && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <p className="text-center text-sm font-bold text-amber-100">Verification code sent to +91 {phoneNumber}</p>
              <p className="text-center text-[10px] text-amber-200/70">Demo OTP: <span className="font-black">1234</span></p>
              <input
                type="text"
                placeholder="• • • •"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field bg-white text-center tracking-[1rem] font-black text-2xl"
              />
              <button
                onClick={handleOtpVerify}
                className="w-full bg-[var(--color-brand-grain)] text-white py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-amber-900/30 hover:bg-[var(--color-brand-amber)]"
              >
                Verify OTP
              </button>
              <button onClick={() => setPhase('PHONE_INPUT')} className="w-full text-amber-100 font-bold text-xs py-2">
                Change number
              </button>
            </div>
          )}

          {phase === 'NAME_PROMPT' && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <p className="text-center text-sm font-bold text-amber-100">Welcome to FAM-GUARD. Tell us your name to set up your farm profile.</p>
              <input
                type="text"
                placeholder="Your Full Name (e.g. Vishnu M)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field bg-white"
                onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()}
              />
              <button
                onClick={handleFinalSubmit}
                className="w-full bg-[var(--color-brand-grain)] text-white py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-amber-900/30 hover:bg-[var(--color-brand-amber)]"
              >
                Continue to Farm Setup
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="w-full py-6 text-center space-y-2 relative z-10">
        <div className="flex items-center justify-center gap-2 text-amber-200 font-black tracking-widest text-[10px] uppercase">
          <i className="fa-solid fa-leaf"></i>
          <span>Mentored by Magesh Kanna S</span>
        </div>
        <p className="text-[10px] text-emerald-100/60 font-bold">
          © 2025 FAM-GUARD · Innovation Ambassador Programme<br />
          Innovator: Vishnu .M
        </p>
      </footer>
    </div>
  );
};

export default Login;
