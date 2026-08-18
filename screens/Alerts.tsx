
import React, { useState } from 'react';
import { AlertEvent, RiskLevel } from '../types';

interface AlertsProps {
  alerts: AlertEvent[];
  onAck: (alertId: string) => void;
  onAckAll: () => void;
}

const riskMeta: Record<RiskLevel, { label: string; color: string; bg: string; border: string; icon: string; pill: string }> = {
  SAFE: { label: 'Safe', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', icon: 'fa-circle-check', pill: 'pill-safe' },
  CHECK: { label: 'Check', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500', icon: 'fa-circle-exclamation', pill: 'pill-check' },
  ACTION: { label: 'Action', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500', border: 'border-red-500', icon: 'fa-triangle-exclamation', pill: 'pill-action' },
};

const categoryIcons: Record<AlertEvent['category'], string> = {
  Temperature: 'fa-temperature-half',
  Humidity: 'fa-droplet',
  CO2: 'fa-wind',
  Moisture: 'fa-seedling',
  Pest: 'fa-bug',
  Device: 'fa-microchip',
  Ventilation: 'fa-fan',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
}

const Alerts: React.FC<AlertsProps> = ({ alerts, onAck, onAckAll }) => {
  const [filter, setFilter] = useState<'ALL' | 'UNACK' | RiskLevel>('ALL');

  const filtered = alerts
    .filter(a => filter === 'ALL' ? true : filter === 'UNACK' ? !a.acknowledged : a.severity === filter)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

  const counts = {
    total: alerts.length,
    unack: alerts.filter(a => !a.acknowledged).length,
    action: alerts.filter(a => a.severity === 'ACTION').length,
    check: alerts.filter(a => a.severity === 'CHECK').length,
    safe: alerts.filter(a => a.severity === 'SAFE').length,
  };

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto animate-in fade-in duration-500 text-stone-900 dark:text-stone-100 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-3xl font-black tracking-tight">Alerts & Notifications</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium mt-1">{counts.unack} unacknowledged of {counts.total} total.</p>
        </div>
        {counts.unack > 0 && (
          <button
            onClick={onAckAll}
            className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 hover:bg-emerald-700 transition-all shadow-lg"
          >
            <i className="fa-solid fa-check-double"></i>
            Acknowledge All
          </button>
        )}
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 border-l-4 border-red-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Action Required</p>
          <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">{counts.action}</p>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Check</p>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{counts.check}</p>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Safe / Info</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{counts.safe}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {(['ALL', 'UNACK', 'ACTION', 'CHECK', 'SAFE'] as const).map(f => {
          const c = f === 'ALL' ? counts.total : f === 'UNACK' ? counts.unack : f === 'ACTION' ? counts.action : f === 'CHECK' ? counts.check : counts.safe;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 ${
                filter === f
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
              }`}
            >
              {f === 'UNACK' ? 'Unacknowledged' : f}
              <span className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-[9px]">{c}</span>
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center border-dashed">
            <i className="fa-solid fa-bell-slash text-4xl text-stone-200 dark:text-stone-700 mb-3"></i>
            <p className="text-stone-400 font-black uppercase tracking-widest text-xs">No alerts match this filter.</p>
          </div>
        ) : (
          filtered.map(a => {
            const meta = riskMeta[a.severity];
            return (
              <div
                key={a.id}
                className={`card p-5 border-l-4 ${meta.border} ${!a.acknowledged ? 'shadow-md' : 'opacity-70'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${meta.bg} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                    <i className={`fa-solid ${meta.icon}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.pill}`}>
                            {meta.label}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1">
                            <i className={`fa-solid ${categoryIcons[a.category]}`}></i>
                            {a.category}
                          </span>
                          {!a.acknowledged && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          )}
                        </div>
                        <h4 className="font-black text-stone-900 dark:text-white text-base leading-tight">{a.title}</h4>
                        <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-0.5">
                          <i className="fa-solid fa-location-dot mr-1"></i>{a.zoneName} · {timeAgo(a.timestamp)}
                        </p>
                      </div>
                      {!a.acknowledged && (
                        <button
                          onClick={() => onAck(a.id)}
                          className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800"
                        >
                          <i className="fa-solid fa-check mr-1"></i>Ack
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 font-medium mt-3 leading-relaxed">{a.detail}</p>

                    <div className="mt-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-leaf)] dark:text-emerald-400 mb-1">
                        <i className="fa-solid fa-lightbulb mr-1"></i>Recommendation
                      </p>
                      <p className="text-xs text-stone-700 dark:text-stone-200 font-medium">{a.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alerts;
