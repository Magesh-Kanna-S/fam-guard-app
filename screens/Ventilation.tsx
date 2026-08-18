
import React, { useState } from 'react';
import { Zone, AppScreen } from '../types';

interface VentilationProps {
  zones: Zone[];
  onToggleVentilation: (zoneId: string) => void;
  onSetAuto: (zoneId: string) => void;
  setScreen: (s: AppScreen) => void;
}

const Ventilation: React.FC<VentilationProps> = ({ zones, onToggleVentilation, onSetAuto }) => {
  const [schedules, setSchedules] = useState<Record<string, { enabled: boolean; startHour: number; durationMin: number }>>(
    Object.fromEntries(zones.map(z => [z.id, { enabled: z.ventilation === 'AUTO', startHour: 22, durationMin: 45 }]))
  );

  const toggleSchedule = (zoneId: string) => {
    setSchedules(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], enabled: !prev[zoneId].enabled } }));
  };

  const updateHour = (zoneId: string, hour: number) => {
    setSchedules(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], startHour: hour } }));
  };

  const updateDuration = (zoneId: string, dur: number) => {
    setSchedules(prev => ({ ...prev, [zoneId]: { ...prev[zoneId], durationMin: dur } }));
  };

  const totalRuntimeThisWeek = zones.reduce((s, z) => s + z.ventilationRuntimeMin, 0);
  const avgRuntime = zones.length ? Math.round(totalRuntimeThisWeek / zones.length) : 0;
  const autoZones = zones.filter(z => z.ventilation === 'AUTO').length;

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto animate-in fade-in duration-500 text-stone-900 dark:text-stone-100 pb-10">
      {/* Header */}
      <div>
        <h3 className="text-3xl font-black tracking-tight">Adaptive Ventilation</h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm font-medium mt-1">
          Auto-mode ventilates during cooler, drier night air (8 PM – 6 AM) to drop bin humidity without re-wetting grain.
        </p>
      </div>

      {/* Insight tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-sky-500 to-cyan-500 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Weekly Runtime</p>
            <p className="text-4xl font-black">{totalRuntimeThisWeek}<span className="text-base ml-1">min</span></p>
            <p className="text-[10px] text-white/80 mt-2">Avg {avgRuntime} min/zone</p>
          </div>
          <i className="fa-solid fa-fan absolute -right-4 -bottom-4 text-white/10 text-[8rem] rotate-12"></i>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Auto-Adaptive Zones</p>
            <p className="text-4xl font-black">{autoZones}<span className="text-base ml-1">/{zones.length}</span></p>
            <p className="text-[10px] text-white/80 mt-2">Smart threshold-based control</p>
          </div>
          <i className="fa-solid fa-robot absolute -right-4 -bottom-4 text-white/10 text-[8rem] rotate-12"></i>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Estimated Energy</p>
            <p className="text-4xl font-black">~₹{Math.round(totalRuntimeThisWeek * 0.25)}<span className="text-base ml-1">/wk</span></p>
            <p className="text-[10px] text-white/80 mt-2">At ₹8/kWh, 35W fan</p>
          </div>
          <i className="fa-solid fa-bolt absolute -right-4 -bottom-4 text-white/10 text-[8rem] rotate-12"></i>
        </div>
      </div>

      {/* Per-zone control */}
      <div className="space-y-4">
        <h4 className="text-lg font-black uppercase tracking-widest text-stone-900 dark:text-white px-1">Per-Zone Control</h4>

        {zones.map(z => {
          const sch = schedules[z.id];
          const isOn = z.ventilation === 'AUTO' || z.ventilation === 'MANUAL_ON';
          return (
            <div key={z.id} className="card p-6 space-y-4">
              {/* Top row: name + master toggle */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${isOn ? 'bg-emerald-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'} flex items-center justify-center shadow-sm`}>
                    <i className={`fa-solid fa-fan text-xl ${isOn ? 'animate-spin' : ''}`} style={isOn ? { animationDuration: '3s' } : {}}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900 dark:text-white">{z.name}</h4>
                    <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                      {z.location} · {z.ventilation} · {z.ventilationRuntimeMin} min this week
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSetAuto(z.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      z.ventilation === 'AUTO'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    <i className="fa-solid fa-robot mr-1"></i>Auto
                  </button>
                  <button
                    onClick={() => onToggleVentilation(z.id)}
                    className={`relative w-16 h-9 rounded-full transition-all ${
                      isOn ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                    title="Manual toggle"
                  >
                    <div className={`absolute top-1 bottom-1 w-7 rounded-full bg-white shadow-md transition-all ${isOn ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>

              {/* Schedule editor */}
              <div className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-clock text-stone-400 text-xs"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">
                      Scheduled Vent Cycle
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSchedule(z.id)}
                    className={`relative w-12 h-7 rounded-full transition-all ${sch.enabled ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'}`}
                  >
                    <div className={`absolute top-1 bottom-1 w-5 rounded-full bg-white shadow-md transition-all ${sch.enabled ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Start Hour (24h)</label>
                    <select
                      value={sch.startHour}
                      onChange={(e) => updateHour(z.id, Number(e.target.value))}
                      disabled={!sch.enabled}
                      className="input-field appearance-none cursor-pointer disabled:opacity-50 py-3"
                    >
                      {[18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5].map(h => (
                        <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-1">Duration (min)</label>
                    <select
                      value={sch.durationMin}
                      onChange={(e) => updateDuration(z.id, Number(e.target.value))}
                      disabled={!sch.enabled}
                      className="input-field appearance-none cursor-pointer disabled:opacity-50 py-3"
                    >
                      {[15, 30, 45, 60, 90, 120].map(d => (
                        <option key={d} value={d}>{d} min</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 dark:text-stone-400">
                  <i className="fa-solid fa-circle-info text-stone-400"></i>
                  {sch.enabled
                    ? `Runs nightly at ${String(sch.startHour).padStart(2, '0')}:00 for ${sch.durationMin} min if outside RH < inside RH and outside T < 30°C`
                    : 'Schedule disabled — Auto mode will trigger only on threshold breach'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational note */}
      <div className="bg-stone-900 dark:bg-stone-800 text-white p-6 rounded-[2rem] flex gap-5 items-start">
        <div className="w-12 h-12 bg-amber-400 text-stone-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <i className="fa-solid fa-book-open"></i>
        </div>
        <div className="space-y-2">
          <h4 className="font-black text-base">Why Night Ventilation Works</h4>
          <p className="text-xs text-stone-300 leading-relaxed">
            Outside air at 2 AM typically holds half the absolute moisture of midday air. Forcing this cooler, drier air through the bin pulls moisture out of the grain without raising its temperature, breaking the fungal growth cycle. TNAU studies confirm 40-60% reduction in storage loss when night-purge ventilation is combined with moisture monitoring.
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">Source: TNAU Agritech Portal — Post-Harvest Technology</p>
        </div>
      </div>
    </div>
  );
};

export default Ventilation;
