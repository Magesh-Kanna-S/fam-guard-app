
import React, { useState, useMemo } from 'react';
import { UserProfile, Zone, AlertEvent, AppScreen, RiskLevel } from '../types';

interface DashboardProps {
  profile: UserProfile;
  zones: Zone[];
  alerts: AlertEvent[];
  setScreen: (s: AppScreen) => void;
  onOpenZone: (zoneId: string) => void;
  onAckAlert: (alertId: string) => void;
}

const riskMeta: Record<RiskLevel, { label: string; color: string; bg: string; border: string; ring: string; icon: string; description: string }> = {
  SAFE: {
    label: 'SAFE',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    ring: 'ring-emerald-200 dark:ring-emerald-900/40',
    icon: 'fa-circle-check',
    description: 'All zones within safe range.',
  },
  CHECK: {
    label: 'CHECK',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    ring: 'ring-amber-200 dark:ring-amber-900/40',
    icon: 'fa-circle-exclamation',
    description: 'Some sensors approaching thresholds.',
  },
  ACTION: {
    label: 'ACTION',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-500',
    border: 'border-red-500',
    ring: 'ring-red-200 dark:ring-red-900/40',
    icon: 'fa-triangle-exclamation',
    description: 'Immediate action needed in flagged zones.',
  },
};

const tips = [
  'Sun-dry grain to 12% moisture before long-term storage to prevent aflatoxin.',
  'Ventilate during 8 PM – 6 AM when outside air is cooler and drier.',
  'A thin layer of neem leaves repels rice weevil without chemicals.',
  'Inspect grain surface weekly for early signs of mould or insect activity.',
  'Hermetic bags reduce oxygen and suffocate stored-grain pests naturally.',
  'Rotate stock — older lots first — to keep shelf-life math honest.',
  'Diurnal temperature swings of 8°C+ cause condensation. Insulate bins.',
  'CO₂ above 1000ppm often signals hidden insect respiration — investigate.',
];

const Dashboard: React.FC<DashboardProps> = ({ profile, zones, alerts, setScreen, onOpenZone, onAckAlert }) => {
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * tips.length));
  const tip = tips[tipIdx];

  const stats = useMemo(() => {
    const safe = zones.filter(z => z.risk === 'SAFE').length;
    const check = zones.filter(z => z.risk === 'CHECK').length;
    const action = zones.filter(z => z.risk === 'ACTION').length;
    const totalKg = zones.reduce((s, z) => s + z.filledKg, 0);
    const capKg = zones.reduce((s, z) => s + z.capacityKg, 0);
    const unackAlerts = alerts.filter(a => !a.acknowledged);
    return { safe, check, action, totalKg, capKg, unackAlerts };
  }, [zones, alerts]);

  const overallRisk: RiskLevel = stats.action > 0 ? 'ACTION' : stats.check > 0 ? 'CHECK' : 'SAFE';
  const overall = riskMeta[overallRisk];

  const recentAlerts = [...alerts].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)).slice(0, 4);

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto pb-10">
      {/* Top greeting */}
      <section className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-forest)] text-white flex items-center justify-center shadow-lg font-black text-xl">
            {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-stone-500 dark:text-stone-400 text-[10px] font-black uppercase tracking-widest">
              {profile.farmName} · {profile.village}
            </p>
            <h2 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Hi, {profile.name.split(' ')[0]}
            </h2>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-2 rounded-xl flex items-center gap-2">
            <i className="fa-solid fa-wifi text-emerald-500 text-xs"></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">Device Online</span>
          </div>
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-2 rounded-xl flex items-center gap-2">
            <i className="fa-solid fa-microchip text-[var(--color-brand-grain)] text-xs"></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 font-mono">{profile.pairedDeviceId}</span>
          </div>
        </div>
      </section>

      {/* HERO risk status */}
      <section
        onClick={() => setScreen(AppScreen.ZONES)}
        className={`rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden cursor-pointer active:scale-[0.99] transition-all group ${overall.bg}`}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-2">Overall Storage Status</p>
              <h3 className="text-4xl md:text-6xl font-black flex items-center gap-4">
                <i className={`fa-solid ${overall.icon}`}></i>
                {overall.label}
              </h3>
              <p className="text-white/90 text-sm font-medium mt-3">{overall.description}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Last sync</p>
              <p className="text-white text-sm font-bold">
                {new Date(Math.max(...zones.map(z => +new Date(z.lastUpdated)))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 mt-8">
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Safe Zones</p>
              <p className="text-3xl font-black">{stats.safe}<span className="text-base">/{zones.length}</span></p>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Check</p>
              <p className="text-3xl font-black">{stats.check}<span className="text-base">/{zones.length}</span></p>
            </div>
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Action</p>
              <p className="text-3xl font-black">{stats.action}<span className="text-base">/{zones.length}</span></p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/90 text-xs font-bold">
              <i className="fa-solid fa-bolt-lightning"></i>
              Total grain monitored
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-black">
                {stats.totalKg.toLocaleString()} kg
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:translate-x-1 transition-transform flex items-center gap-2">
              View Zones <i className="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>
        <i className="fa-solid fa-wheat-awn absolute -right-8 -top-8 text-white/10 text-[14rem] rotate-12 transition-transform group-hover:rotate-0 duration-700"></i>
      </section>

      {/* Quick stat tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Capacity Used', value: `${Math.round((stats.totalKg / stats.capKg) * 100)}%`, sub: `${stats.totalKg}/${stats.capKg} kg`, icon: 'fa-warehouse', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Unack Alerts', value: stats.unackAlerts.length, sub: stats.unackAlerts.length === 0 ? 'All clear' : 'Tap to view', icon: 'fa-bell', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', onClick: () => setScreen(AppScreen.ALERTS) },
          { label: 'Vent Runtime', value: `${zones.reduce((s, z) => s + z.ventilationRuntimeMin, 0)} min`, sub: 'this week', icon: 'fa-fan', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20', onClick: () => setScreen(AppScreen.VENTILATION) },
          { label: 'Active Lots', value: zones.length, sub: 'grain lots stored', icon: 'fa-layer-group', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', onClick: () => setScreen(AppScreen.INVENTORY) },
        ].map(t => (
          <button
            key={t.label}
            onClick={t.onClick}
            className="card p-5 flex flex-col gap-3 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all active:scale-95 text-left"
          >
            <div className={`w-10 h-10 rounded-2xl ${t.bg} ${t.color} flex items-center justify-center`}>
              <i className={`fa-solid ${t.icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500">{t.label}</p>
              <p className="text-xl font-black text-stone-900 dark:text-white">{t.value}</p>
              <p className="text-[10px] font-medium text-stone-400">{t.sub}</p>
            </div>
          </button>
        ))}
      </section>

      {/* Two-column layout: Zones + Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Zones (left, span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl md:text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tight">Storage Zones</h3>
            <button onClick={() => setScreen(AppScreen.ZONES)} className="text-xs font-black text-[var(--color-brand-leaf)] uppercase tracking-widest">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {zones.map(z => {
              const meta = riskMeta[z.risk];
              const fillPct = Math.round((z.filledKg / z.capacityKg) * 100);
              return (
                <button
                  key={z.id}
                  onClick={() => onOpenZone(z.id)}
                  className="card w-full p-5 flex items-center gap-5 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all active:scale-[0.98] text-left"
                >
                  <div className={`w-14 h-14 rounded-2xl ${meta.bg} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                    <i className={`fa-solid ${meta.icon} text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-stone-900 dark:text-white text-lg truncate">{z.name}</h4>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.color} bg-stone-100 dark:bg-stone-800`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-0.5">
                      {z.location} · {z.crop} · {z.storageType}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-stone-500 dark:text-stone-400">
                      <span><i className="fa-solid fa-temperature-half mr-1 text-stone-400"></i>{z.sensors[0].value}°C</span>
                      <span><i className="fa-solid fa-droplet mr-1 text-stone-400"></i>{z.sensors[1].value}%</span>
                      <span><i className="fa-solid fa-wind mr-1 text-stone-400"></i>{z.sensors[2].value}ppm</span>
                      <span><i className="fa-solid fa-seedling mr-1 text-stone-400"></i>{z.sensors[3].value}%wb</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="w-14 h-14 rounded-full border-4 border-stone-100 dark:border-stone-800 flex items-center justify-center relative">
                      <div
                        className={`absolute inset-0 rounded-full ${meta.bg} opacity-15`}
                        style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(2 * Math.PI * fillPct / 100)}% ${50 - 50 * Math.cos(2 * Math.PI * fillPct / 100)}%)` }}
                      />
                      <span className="text-[10px] font-black text-stone-700 dark:text-stone-300">{fillPct}%</span>
                    </div>
                    <p className="text-[9px] font-black text-stone-400 uppercase mt-1">{z.filledKg}/{z.capacityKg}kg</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: tip + alerts */}
        <div className="space-y-4">
          {/* Daily tip */}
          <div className="bg-gradient-to-br from-[var(--color-brand-grain)] to-[var(--color-brand-amber)] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Daily Grain Tip</p>
                <button
                  onClick={() => setTipIdx((tipIdx + 1) % tips.length)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all active:scale-90"
                >
                  <i className="fa-solid fa-arrows-rotate text-xs"></i>
                </button>
              </div>
              <p className="text-sm font-bold leading-relaxed">{tip}</p>
            </div>
            <i className="fa-solid fa-lightbulb absolute -right-4 -bottom-4 text-white/15 text-[8rem] rotate-12"></i>
          </div>

          {/* Recent alerts */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-stone-900 dark:text-white text-sm uppercase tracking-widest">Recent Alerts</h4>
              <button onClick={() => setScreen(AppScreen.ALERTS)} className="text-[10px] font-black text-[var(--color-brand-leaf)] uppercase tracking-widest">All</button>
            </div>
            {recentAlerts.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">No alerts yet.</p>
            ) : (
              <div className="space-y-2">
                {recentAlerts.slice(0, 3).map(a => {
                  const meta = riskMeta[a.severity];
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                      <div className={`w-2 h-2 rounded-full ${meta.bg} mt-1.5 shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-white truncate">{a.title}</p>
                        <p className="text-[10px] text-stone-400 font-medium">{a.zoneName} · {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {!a.acknowledged && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onAckAlert(a.id); }}
                          className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 active:scale-95"
                        >
                          Ack
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Advisory quick launch */}
          <button
            onClick={() => setScreen(AppScreen.ADVISORY_CHAT)}
            className="w-full bg-stone-900 dark:bg-stone-800 text-white p-5 rounded-[2rem] flex items-center gap-4 active:scale-95 transition-all shadow-xl hover:bg-stone-800 dark:hover:bg-stone-700"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-message text-lg"></i>
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-sm">Ask FAM-GUARD AI</p>
              <p className="text-[10px] text-stone-400 font-medium">Pest? Mould? Ventilation timing?</p>
            </div>
            <i className="fa-solid fa-chevron-right text-stone-400"></i>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
