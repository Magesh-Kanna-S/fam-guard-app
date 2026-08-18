
import React, { useState } from 'react';
import { Zone, RiskLevel, SensorReading } from '../types';
import { getRiskMitigationPlan, AdvisoryPlan } from '../services/gemini';

interface ZonesProps {
  zones: Zone[];
  onOpenZone: (zoneId: string) => void;
  onToggleVentilation: (zoneId: string) => void;
  onAddZone: () => void;
}

const riskMeta: Record<RiskLevel, { label: string; color: string; bg: string; border: string; icon: string; pill: string }> = {
  SAFE: { label: 'SAFE', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', icon: 'fa-circle-check', pill: 'pill-safe' },
  CHECK: { label: 'CHECK', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500', icon: 'fa-circle-exclamation', pill: 'pill-check' },
  ACTION: { label: 'ACTION', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500', border: 'border-red-500', icon: 'fa-triangle-exclamation', pill: 'pill-action' },
};

function sensorStatus(s: SensorReading): 'safe' | 'warn' | 'critical' {
  if (s.value < s.safeMin || s.value > s.safeMax) {
    // Critical thresholds
    if (s.key === 'humidity' && s.value > 75) return 'critical';
    if (s.key === 'temperature' && s.value > 32) return 'critical';
    if (s.key === 'moisture' && s.value > 15) return 'critical';
    if (s.key === 'co2' && s.value > 1500) return 'critical';
    return 'warn';
  }
  return 'safe';
}

function sensorColor(status: 'safe' | 'warn' | 'critical') {
  switch (status) {
    case 'safe': return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'ring-emerald-200 dark:ring-emerald-900/40' };
    case 'warn': return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', ring: 'ring-amber-200 dark:ring-amber-900/40' };
    case 'critical': return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', ring: 'ring-red-200 dark:ring-red-900/40' };
  }
}

function sensorBarPct(s: SensorReading): number {
  // Normalise value across 0..(safeMax * 1.5)
  const max = s.safeMax * 1.5;
  return Math.min(100, Math.max(0, (s.value / max) * 100));
}

const ZoneDetailModal: React.FC<{
  zone: Zone;
  onClose: () => void;
  onToggleVentilation: (zoneId: string) => void;
  profileName: string;
}> = ({ zone, onClose, onToggleVentilation, profileName }) => {
  const meta = riskMeta[zone.risk];
  const fillPct = Math.round((zone.filledKg / zone.capacityKg) * 100);
  const [plan, setPlan] = useState<AdvisoryPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const generatePlan = async () => {
    setLoadingPlan(true);
    const p = await getRiskMitigationPlan(zone, { name: profileName } as any);
    setPlan(p);
    setLoadingPlan(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-stone-950 w-full md:max-w-2xl md:rounded-[2.5rem] rounded-t-[2.5rem] max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl">
        {/* Header */}
        <div className={`${meta.bg} text-white p-6 md:p-8 sticky top-0 z-10`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">{zone.location}</p>
              <h3 className="text-2xl md:text-3xl font-black">{zone.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{zone.crop}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{zone.storageType}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <i className="fa-solid fa-circle text-[6px]"></i>{meta.label}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all active:scale-90">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Sensors grid */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Live Sensor Readings</h4>
            <div className="grid grid-cols-2 gap-3">
              {zone.sensors.map(s => {
                const status = sensorStatus(s);
                const c = sensorColor(status);
                const pct = sensorBarPct(s);
                return (
                  <div key={s.key} className={`p-4 rounded-2xl ${c.bg} border border-transparent`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 rounded-xl bg-white dark:bg-stone-900 ${c.text} flex items-center justify-center shadow-sm`}>
                        <i className={`fa-solid ${s.icon}`}></i>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${c.text}`}>
                        {status === 'safe' ? 'In range' : status === 'warn' ? 'Approaching' : 'Critical'}
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">{s.label}</p>
                    <p className="text-2xl font-black text-stone-900 dark:text-white mt-0.5">
                      {s.value}<span className="text-xs font-bold ml-1">{s.unit}</span>
                    </p>
                    <div className="mt-3 h-1.5 w-full bg-white/70 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div className={`h-full ${c.text.replace('text-', 'bg-')} transition-all`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <p className="text-[9px] text-stone-400 mt-1 font-medium">Safe: {s.safeMin}-{s.safeMax}{s.unit}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capacity & safe days */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Filled Capacity</p>
              <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">{zone.filledKg}<span className="text-xs">/{zone.capacityKg} kg</span></p>
              <div className="mt-2 h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-brand-leaf)] transition-all" style={{ width: `${fillPct}%` }}></div>
              </div>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Safe Days Remaining</p>
              <p className={`text-2xl font-black mt-1 ${zone.safeDaysRemaining < 14 ? 'text-red-600 dark:text-red-400' : zone.safeDaysRemaining < 30 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {zone.safeDaysRemaining}
                <span className="text-xs ml-1 text-stone-500">days</span>
              </p>
              <p className="text-[10px] text-stone-400 mt-1">at current trend</p>
            </div>
          </div>

          {/* Ventilation status */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ventilation</p>
                <p className="text-lg font-black text-stone-900 dark:text-white">
                  {zone.ventilation === 'AUTO' ? 'Auto-Adaptive' :
                   zone.ventilation === 'MANUAL_ON' ? 'Manual ON' :
                   zone.ventilation === 'MANUAL_OFF' ? 'Manual OFF' : 'Fault Detected'}
                </p>
              </div>
              <button
                onClick={() => onToggleVentilation(zone.id)}
                className={`relative w-16 h-9 rounded-full transition-all ${zone.ventilation === 'MANUAL_ON' || zone.ventilation === 'AUTO' ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'}`}
              >
                <div className={`absolute top-1 bottom-1 w-7 rounded-full bg-white shadow-md transition-all ${zone.ventilation === 'MANUAL_ON' || zone.ventilation === 'AUTO' ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
            <p className="text-[10px] text-stone-400 font-medium">Runtime this week: <span className="font-black text-stone-600 dark:text-stone-300">{zone.ventilationRuntimeMin} min</span> · Last update: {new Date(zone.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {/* AI Mitigation Plan */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-900 dark:to-stone-950 p-5 rounded-2xl text-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">AI Risk Mitigation</p>
                <h4 className="font-black text-base">Get a 3-step action plan</h4>
              </div>
              <button
                onClick={generatePlan}
                disabled={loadingPlan}
                className="bg-amber-400 text-stone-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 hover:bg-amber-300 disabled:opacity-60"
              >
                {loadingPlan ? 'Generating…' : plan ? 'Regenerate' : 'Generate Plan'}
              </button>
            </div>
            {plan && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">Immediate</p>
                  <ul className="space-y-1">
                    {plan.immediateActions.map((a, i) => <li key={i} className="text-xs flex gap-2"><i className="fa-solid fa-circle text-[4px] text-amber-400 mt-1.5"></i>{a}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">Within 24 Hours</p>
                  <ul className="space-y-1">
                    {plan.within24Hours.map((a, i) => <li key={i} className="text-xs flex gap-2"><i className="fa-solid fa-circle text-[4px] text-amber-400 mt-1.5"></i>{a}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">Preventive</p>
                  <ul className="space-y-1">
                    {plan.preventive.map((a, i) => <li key={i} className="text-xs flex gap-2"><i className="fa-solid fa-circle text-[4px] text-amber-400 mt-1.5"></i>{a}</li>)}
                  </ul>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] text-emerald-300 font-bold">Estimated loss avoided: <span className="font-black">{plan.estimatedLossAvoidedPct}%</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Zones: React.FC<ZonesProps> = ({ zones, onOpenZone, onToggleVentilation, onAddZone }) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [filter, setFilter] = useState<'ALL' | RiskLevel>('ALL');

  const filtered = filter === 'ALL' ? zones : zones.filter(z => z.risk === filter);

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto animate-in fade-in duration-500 text-stone-900 dark:text-stone-100">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-3xl font-black tracking-tight">Storage Zones</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium mt-1">Multi-zone real-time sensor monitoring.</p>
        </div>
        <button
          onClick={onAddZone}
          className="bg-[var(--color-brand-forest)] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all hover:bg-[var(--color-brand-leaf)] shadow-lg"
        >
          <i className="fa-solid fa-plus"></i>
          Add Zone
        </button>
      </div>

      {/* Risk filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {(['ALL', 'SAFE', 'CHECK', 'ACTION'] as const).map(f => {
          const count = f === 'ALL' ? zones.length : zones.filter(z => z.risk === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                filter === f
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
              }`}
            >
              {f}
              <span className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-[9px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Zone grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(z => {
          const meta = riskMeta[z.risk];
          const fillPct = Math.round((z.filledKg / z.capacityKg) * 100);
          return (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z)}
              className={`card p-6 text-left hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all active:scale-[0.98] border-t-4 ${meta.border}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${meta.bg} text-white flex items-center justify-center shadow-lg`}>
                    <i className={`fa-solid ${meta.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900 dark:text-white text-lg leading-tight">{z.name}</h4>
                    <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">{z.location}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${meta.pill}`}>
                  {meta.label}
                </span>
              </div>

              {/* Sensor mini-stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {z.sensors.map(s => {
                  const status = sensorStatus(s);
                  const c = sensorColor(status);
                  return (
                    <div key={s.key} className={`p-2 rounded-lg ${c.bg} text-center`}>
                      <i className={`fa-solid ${s.icon} text-[10px] ${c.text}`}></i>
                      <p className={`text-xs font-black mt-0.5 ${c.text}`}>{s.value}</p>
                      <p className="text-[7px] text-stone-500 uppercase font-bold">{s.unit}</p>
                    </div>
                  );
                })}
              </div>

              {/* Capacity bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-1">
                  <span>{z.filledKg}/{z.capacityKg} kg</span>
                  <span>{fillPct}% filled</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-brand-leaf)] transition-all" style={{ width: `${fillPct}%` }}></div>
                </div>
              </div>

              {/* Footer meta */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 dark:text-stone-400">
                  <i className={`fa-solid ${z.ventilation === 'AUTO' || z.ventilation === 'MANUAL_ON' ? 'fa-fan text-emerald-500' : 'fa-fan text-stone-400'}`}></i>
                  <span>{z.ventilation}</span>
                </div>
                <p className="text-[10px] font-bold text-stone-400">
                  <i className="fa-solid fa-clock mr-1"></i>{new Date(z.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedZone && (
        <ZoneDetailModal
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onToggleVentilation={(zid) => {
            onToggleVentilation(zid);
            // Update local modal copy immediately
            setSelectedZone(prev => prev ? {
              ...prev,
              ventilation: prev.ventilation === 'AUTO' ? 'MANUAL_OFF' : prev.ventilation === 'MANUAL_OFF' ? 'MANUAL_ON' : prev.ventilation === 'MANUAL_ON' ? 'MANUAL_OFF' : 'AUTO'
            } : prev);
          }}
          profileName="Vishnu"
        />
      )}
    </div>
  );
};

export default Zones;
