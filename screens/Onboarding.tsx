
import React, { useState } from 'react';
import { UserProfile, CropType } from '../types';

interface OnboardingProps {
  initialProfile?: Partial<UserProfile>;
  onComplete: (profile: Partial<UserProfile>) => void;
}

const cropOptions: CropType[] = ['Paddy', 'Wheat', 'Maize', 'Ragi', 'Bajra', 'Pulses', 'Groundnut', 'Soybean', 'Mixed'];
const stateOptions = ['Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Kerala', 'Maharashtra', 'Uttar Pradesh', 'Punjab', 'Bihar', 'Odisha'];
const seasonMonths = ['January', 'April (Rabi)', 'July (Kharif)', 'October'];

const Onboarding: React.FC<OnboardingProps> = ({ initialProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [farmName, setFarmName] = useState(initialProfile?.farmName || '');
  const [village, setVillage] = useState(initialProfile?.village || '');
  const [district, setDistrict] = useState(initialProfile?.district || '');
  const [state, setState] = useState(initialProfile?.state || 'Tamil Nadu');
  const [land, setLand] = useState(initialProfile?.totalLandHoldingAcres || 1);
  const [primaryCrop, setPrimaryCrop] = useState<CropType>(initialProfile?.primaryCrop || 'Paddy');
  const [season, setSeason] = useState(initialProfile?.seasonStartMonth || 'April (Rabi)');
  const [deviceId, setDeviceId] = useState(initialProfile?.pairedDeviceId || 'FAM-GUARD-01');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const finish = () => {
    onComplete({
      farmName: farmName || 'My Family Farm',
      village: village || 'Poongulam',
      district: district || 'Tiruvarur',
      state,
      totalLandHoldingAcres: land,
      primaryCrop,
      seasonStartMonth: season,
      pairedDeviceId: deviceId,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 max-w-md mx-auto flex flex-col p-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div className="h-2 flex-1 bg-stone-100 dark:bg-stone-800 rounded-full mr-4">
          <div className="h-full bg-[var(--color-brand-leaf)] rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
        <span className="text-sm font-bold text-[var(--color-brand-leaf)]">{step}/4</span>
      </div>

      <div className="flex-1 space-y-6">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">Farm Identity</h2>
              <p className="text-stone-500 dark:text-stone-400 mt-2">Tell us about your farm so we can tailor your monitoring thresholds.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Farm Name</label>
                <input value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder="e.g. Vishnu Family Farm" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Village</label>
                  <input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Poongulam" className="input-field" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">District</label>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Tiruvarur" className="input-field" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)} className="input-field appearance-none cursor-pointer">
                  {stateOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">Land & Crop</h2>
              <p className="text-stone-500 dark:text-stone-400 mt-2">Your primary crop determines safe storage moisture and shelf-life defaults.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Total Land Holding (acres)</label>
                <input type="number" step="0.1" min="0.1" value={land} onChange={(e) => setLand(parseFloat(e.target.value))} className="input-field" />
                <p className="text-[10px] text-stone-400 mt-1 ml-2">Marginal (≤ 1 ha) · Small (1-2 ha) · Semi-medium (2-4 ha)</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Primary Crop</label>
                <div className="grid grid-cols-3 gap-2">
                  {cropOptions.map(c => (
                    <button
                      key={c}
                      onClick={() => setPrimaryCrop(c)}
                      className={`px-3 py-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                        primaryCrop === c
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Season Start</label>
                <select value={season} onChange={(e) => setSeason(e.target.value)} className="input-field appearance-none cursor-pointer">
                  {seasonMonths.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">Pair FAM-GUARD Device</h2>
              <p className="text-stone-500 dark:text-stone-400 mt-2">Enter the device ID printed on the bottom of your FAM-GUARD unit, or scan the QR code on the box.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Device ID</label>
                <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="FAM-GUARD-XX" className="input-field font-mono tracking-wider" />
              </div>
              <button
                onClick={() => alert('QR scanner would open here. (Simulated for prototype.)')}
                className="w-full bg-stone-900 dark:bg-stone-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <i className="fa-solid fa-qrcode text-lg"></i>
                Scan QR Code
              </button>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <i className="fa-solid fa-circle-check text-xs"></i>
                  <p className="text-[10px] font-black uppercase tracking-widest">Demo Device Pre-loaded</p>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium mt-2">
                  We have connected FAM-GUARD-01 with 4 sample storage zones for your demonstration. You can rename or add more zones later.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">Confirm Setup</h2>
              <p className="text-stone-500 dark:text-stone-400 mt-2">Review your farm profile. You can edit this anytime from Settings.</p>
            </div>
            <div className="card p-6 space-y-4">
              {[
                { label: 'Farm Name', value: farmName || 'My Family Farm' },
                { label: 'Location', value: `${village || 'Poongulam'}, ${district || 'Tiruvarur'}, ${state}` },
                { label: 'Land Holding', value: `${land} acres` },
                { label: 'Primary Crop', value: primaryCrop },
                { label: 'Season', value: season },
                { label: 'Device', value: deviceId },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center pb-3 border-b border-stone-100 dark:border-stone-800 last:border-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{row.label}</p>
                  <p className="text-sm font-bold text-stone-900 dark:text-white text-right">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
              <i className="fa-solid fa-lightbulb text-amber-600 dark:text-amber-400 mt-0.5"></i>
              <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                Safe thresholds (TNAU/FAO): Temp 15-27°C · RH 30-65% · CO₂ ≤ 1000ppm · Grain Moisture 8-13%wb. You will be alerted if any reading exceeds these.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        {step > 1 && (
          <button onClick={prevStep} className="flex-1 py-4 text-stone-500 font-bold">
            Back
          </button>
        )}
        <button
          onClick={step === 4 ? finish : nextStep}
          className="flex-[2] py-4 bg-[var(--color-brand-forest)] text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-[var(--color-brand-leaf)] transition-all active:scale-95"
        >
          {step === 4 ? 'Activate FAM-GUARD' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
