
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate, onClose }) => {
  const [settings, setSettings] = useState({
    theme: profile.theme,
    language: profile.language,
    offlineMode: profile.offlineMode,
    smsAlerts: true,
    pushAlerts: true,
    ivrAlerts: false,
    weeklyReport: true,
    autoVentOptIn: true,
    sensorFrequency: '15 min',
    unitSystem: 'metric',
  });

  const save = () => {
    onUpdate({
      theme: settings.theme,
      language: settings.language,
      offlineMode: settings.offlineMode,
    });
    onClose();
  };

  return (
    <div className="space-y-6 max-w-screen-md mx-auto p-4 md:p-6 pb-10 animate-in fade-in duration-300 text-stone-900 dark:text-stone-100">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black tracking-tight">Settings</h3>
        <button onClick={onClose} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Device info */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-[var(--color-brand-leaf)] dark:text-emerald-400 flex items-center justify-center">
            <i className="fa-solid fa-microchip text-xl"></i>
          </div>
          <div>
            <h4 className="font-black text-lg">FAM-GUARD Device</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Hardware & Firmware</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Device ID', value: profile.pairedDeviceId || 'FAM-GUARD-01' },
            { label: 'Model', value: 'FAM-GUARD v1.0 (4-zone)' },
            { label: 'Firmware', value: 'v1.2.4' },
            { label: 'Last calibration', value: '3 days ago' },
            { label: 'Battery (sensor node)', value: '87%' },
            { label: 'Connectivity', value: 'Wi-Fi + 4G fallback' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{row.label}</p>
              <p className="text-sm font-bold text-stone-900 dark:text-white">{row.value}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => alert('Checking for firmware updates… (Simulated)')}
          className="mt-4 w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-3 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
        >
          <i className="fa-solid fa-arrows-rotate mr-2"></i>Check Firmware Update
        </button>
      </div>

      {/* Appearance */}
      <div className="card p-6 space-y-4">
        <h4 className="text-base font-black uppercase tracking-widest text-[var(--color-brand-leaf)] dark:text-emerald-400">Appearance & Language</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-white">Theme</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Switch between light and dark mode</p>
            </div>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSettings({ ...settings, theme: t })}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    settings.theme === t
                      ? 'bg-emerald-500 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                  }`}
                >
                  <i className={`fa-solid ${t === 'light' ? 'fa-sun' : 'fa-moon'} mr-1`}></i>{t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-stone-100 dark:border-stone-800">
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-white">Language</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">App interface language</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value as any })}
              className="input-field appearance-none cursor-pointer w-auto py-2 px-4 text-sm"
            >
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6 space-y-4">
        <h4 className="text-base font-black uppercase tracking-widest text-[var(--color-brand-leaf)] dark:text-emerald-400">Alerts & Notifications</h4>
        <div className="space-y-3">
          {[
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive ACTION-level alerts via SMS', icon: 'fa-message' },
            { key: 'pushAlerts', label: 'Push Notifications', desc: 'In-app push for all severities', icon: 'fa-bell' },
            { key: 'ivrAlerts', label: 'Voice Call Alerts (IVR)', desc: 'Auto-call for critical events (Pro plan)', icon: 'fa-phone-volume' },
            { key: 'weeklyReport', label: 'Weekly Summary Report', desc: 'Email/SMS digest every Monday', icon: 'fa-file-lines' },
            { key: 'autoVentOptIn', label: 'Auto-Ventilation Opt-In', desc: 'Allow AI to trigger ventilation on threshold breach', icon: 'fa-fan' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center">
                  <i className={`fa-solid ${item.icon} text-xs`}></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900 dark:text-white">{item.label}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                className={`relative w-12 h-7 rounded-full transition-all ${(settings as any)[item.key] ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'}`}
              >
                <div className={`absolute top-1 bottom-1 w-5 rounded-full bg-white shadow-md transition-all ${(settings as any)[item.key] ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor config */}
      <div className="card p-6 space-y-4">
        <h4 className="text-base font-black uppercase tracking-widest text-[var(--color-brand-leaf)] dark:text-emerald-400">Sensor Configuration</h4>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Reading Frequency</label>
            <select
              value={settings.sensorFrequency}
              onChange={(e) => setSettings({ ...settings, sensorFrequency: e.target.value })}
              className="input-field appearance-none cursor-pointer mt-1"
            >
              <option>5 min</option>
              <option>15 min</option>
              <option>30 min</option>
              <option>60 min</option>
            </select>
            <p className="text-[10px] text-stone-500 mt-1 ml-1">Lower interval = better detection but higher battery use</p>
          </div>
        </div>
      </div>

      {/* Offline mode */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <i className="fa-solid fa-plane-up text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-white">Offline Mode</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Cache readings locally when internet is down. Sync when back online.</p>
            </div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, offlineMode: !settings.offlineMode })}
            className={`relative w-12 h-7 rounded-full transition-all ${settings.offlineMode ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'}`}
          >
            <div className={`absolute top-1 bottom-1 w-5 rounded-full bg-white shadow-md transition-all ${settings.offlineMode ? 'right-1' : 'left-1'}`}></div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card p-6 space-y-3">
        <h4 className="text-base font-black uppercase tracking-widest text-[var(--color-brand-leaf)] dark:text-emerald-400">About</h4>
        <div className="space-y-2 text-xs">
          <p className="font-bold text-stone-900 dark:text-white">FAM-GUARD v1.0.0</p>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            Family Agricultural Resource & Grain Utility & Alert Device — protecting every grain, empowering every home. Built by Vishnu .M, mentored by Magesh Kanna S (Innovation Ambassador).
          </p>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest pt-2">
            <i className="fa-solid fa-leaf mr-1"></i>Made in Tamil Nadu, for India's small-holder farmers.
          </p>
        </div>
      </div>

      <button onClick={save} className="btn-primary w-full py-5 text-base">
        <i className="fa-solid fa-floppy-disk mr-2"></i>Save Settings
      </button>
    </div>
  );
};

export default Settings;
