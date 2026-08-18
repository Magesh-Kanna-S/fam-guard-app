
import React, { useState } from 'react';
import { UserProfile, CropType } from '../types';

interface ProfileEditProps {
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

const cropOptions: CropType[] = ['Paddy', 'Wheat', 'Maize', 'Ragi', 'Bajra', 'Pulses', 'Groundnut', 'Soybean', 'Mixed'];

const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onSave, onClose }) => {
  const [edited, setEdited] = useState<Partial<UserProfile>>(profile);

  return (
    <div className="space-y-6 max-w-screen-md mx-auto p-4 md:p-6 pb-10 animate-in fade-in duration-300 text-stone-900 dark:text-stone-100">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight">Edit Profile</h3>
        <button onClick={onClose} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="card p-6 md:p-8 space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h4 className="text-base font-black uppercase tracking-widest text-[var(--color-brand-leaf)] dark:text-emerald-400">Personal Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">Display Name</label>
              <input value={edited.name} onChange={(e) => setEdited({ ...edited, name: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">Phone</label>
              <input type="tel" value={edited.phone || ''} onChange={(e) => setEdited({ ...edited, phone: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {/* Farm Info */}
        <div className="space-y-4 pt-6 border-t border-stone-100 dark:border-stone-800">
          <h4 className="text-base font-black uppercase tracking-widest text-[var(--color-brand-leaf)] dark:text-emerald-400">Farm Info</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">Farm Name</label>
              <input value={edited.farmName} onChange={(e) => setEdited({ ...edited, farmName: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">Village</label>
              <input value={edited.village} onChange={(e) => setEdited({ ...edited, village: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">District</label>
              <input value={edited.district} onChange={(e) => setEdited({ ...edited, district: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">State</label>
              <input value={edited.state} onChange={(e) => setEdited({ ...edited, state: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">Land Holding (acres)</label>
              <input type="number" step="0.1" value={edited.totalLandHoldingAcres} onChange={(e) => setEdited({ ...edited, totalLandHoldingAcres: parseFloat(e.target.value) })} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">Primary Crop</label>
              <select value={edited.primaryCrop} onChange={(e) => setEdited({ ...edited, primaryCrop: e.target.value as CropType })} className="input-field appearance-none cursor-pointer">
                {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div className="space-y-4 pt-6 border-t border-stone-100 dark:border-stone-800">
          <h4 className="text-base font-black uppercase tracking-widest text-[var(--color-brand-leaf)] dark:text-emerald-400">Device</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">Device ID</label>
              <input value={edited.pairedDeviceId || ''} onChange={(e) => setEdited({ ...edited, pairedDeviceId: e.target.value })} className="input-field font-mono tracking-wider" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 ml-1">Season Start</label>
              <input value={edited.seasonStartMonth || ''} onChange={(e) => setEdited({ ...edited, seasonStartMonth: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        <button onClick={() => onSave(edited)} className="btn-primary w-full py-5 text-base">
          <i className="fa-solid fa-floppy-disk mr-2"></i>Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit;
