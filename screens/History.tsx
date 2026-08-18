
import React, { useState } from 'react';
import { Zone, TrendPoint } from '../types';
import { SEED_TRENDS } from '../services/seedData';

interface HistoryProps {
  zones: Zone[];
}

const COLORS = {
  temperature: '#DC2626',
  humidity: '#0EA5E9',
  co2: '#7C3AED',
  moisture: '#16A34A',
};

type Metric = keyof Omit<TrendPoint, 't'>;

const metricMeta: Record<Metric, { label: string; unit: string; icon: string; safeMin: number; safeMax: number; color: string }> = {
  temperature: { label: 'Temperature', unit: '°C', icon: 'fa-temperature-half', safeMin: 15, safeMax: 27, color: COLORS.temperature },
  humidity: { label: 'Relative Humidity', unit: '%', icon: 'fa-droplet', safeMin: 30, safeMax: 65, color: COLORS.humidity },
  co2: { label: 'CO₂', unit: 'ppm', icon: 'fa-wind', safeMin: 350, safeMax: 1000, color: COLORS.co2 },
  moisture: { label: 'Grain Moisture', unit: '%wb', icon: 'fa-seedling', safeMin: 8, safeMax: 13, color: COLORS.moisture },
};

function MiniLineChart({ data, metric }: { data: TrendPoint[]; metric: Metric }) {
  const meta = metricMeta[metric];
  const W = 320;
  const H = 140;
  const PAD = 20;

  const values = data.map(d => d[metric] as number);
  const min = Math.min(...values, meta.safeMin);
  const max = Math.max(...values, meta.safeMax);
  const range = max - min || 1;

  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (data.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - 2 * PAD);

  const points = data.map((d, i) => `${x(i)},${y(d[metric] as number)}`).join(' ');
  const safeAreaY1 = y(meta.safeMax);
  const safeAreaY2 = y(meta.safeMin);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Safe zone band */}
      <rect
        x={PAD}
        y={Math.min(safeAreaY1, safeAreaY2)}
        width={W - 2 * PAD}
        height={Math.abs(safeAreaY2 - safeAreaY1)}
        fill="#10B98120"
        stroke="#10B98140"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(p => (
        <line key={p} x1={PAD} x2={W - PAD} y1={PAD + p * (H - 2 * PAD)} y2={PAD + p * (H - 2 * PAD)} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
      ))}
      {/* Line */}
      <polyline points={points} fill="none" stroke={meta.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d[metric] as number)} r="3.5" fill={meta.color} />
          <text x={x(i)} y={H - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor" fillOpacity="0.5">{d.t}</text>
        </g>
      ))}
      {/* Last value label */}
      <text x={x(data.length - 1)} y={y(values[values.length - 1]) - 8} textAnchor="end" fontSize="11" fontWeight="800" fill={meta.color}>
        {values[values.length - 1]}{meta.unit}
      </text>
    </svg>
  );
}

const History: React.FC<HistoryProps> = ({ zones }) => {
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || '');
  const [selectedMetric, setSelectedMetric] = useState<Metric>('temperature');

  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[0];
  const trend = SEED_TRENDS[selectedZoneId] || SEED_TRENDS['z1'];
  const meta = metricMeta[selectedMetric];

  const lastValue = trend[trend.length - 1][selectedMetric] as number;
  const firstValue = trend[0][selectedMetric] as number;
  const delta = lastValue - firstValue;
  const deltaPct = ((delta / firstValue) * 100).toFixed(1);

  const isInRange = lastValue >= meta.safeMin && lastValue <= meta.safeMax;

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto animate-in fade-in duration-500 text-stone-900 dark:text-stone-100 pb-10">
      <div>
        <h3 className="text-3xl font-black tracking-tight">Trends & Analytics</h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm font-medium mt-1">7-day sensor history with safe-zone overlays.</p>
      </div>

      {/* Zone selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {zones.map(z => (
          <button
            key={z.id}
            onClick={() => setSelectedZoneId(z.id)}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
              selectedZoneId === z.id
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
            }`}
          >
            <i className="fa-solid fa-layer-group mr-1.5"></i>
            {z.name}
          </button>
        ))}
      </div>

      {/* Metric selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(metricMeta) as Metric[]).map(m => {
          const mm = metricMeta[m];
          const value = trend[trend.length - 1][m] as number;
          const isSafe = value >= mm.safeMin && value <= mm.safeMax;
          return (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                selectedMetric === m
                  ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800'
                  : 'border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <i className={`fa-solid ${mm.icon} text-sm`} style={{ color: mm.color }}></i>
                <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">{mm.label}</p>
              <p className="text-lg font-black text-stone-900 dark:text-white">{value}<span className="text-[10px] ml-1 text-stone-500">{mm.unit}</span></p>
            </button>
          );
        })}
      </div>

      {/* Main chart card */}
      <div className="card p-6 md:p-8">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{selectedZone?.name} · {meta.label}</p>
            <h4 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-3 mt-1">
              <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color }}></i>
              {lastValue}{meta.unit}
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${isInRange ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
                {isInRange ? 'In Safe Range' : 'Out of Range'}
              </span>
            </h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">7-day change</p>
            <p className={`text-xl font-black ${delta > 0 ? 'text-red-600 dark:text-red-400' : delta < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500'}`}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}{meta.unit} ({delta > 0 ? '+' : ''}{deltaPct}%)
            </p>
          </div>
        </div>

        <div className="text-stone-900 dark:text-stone-100">
          <MiniLineChart data={trend} metric={selectedMetric} />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex-wrap">
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500">
            <span className="w-3 h-3 rounded-sm" style={{ background: meta.color }}></span>
            {meta.label}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40 border-dashed"></span>
            Safe Zone ({meta.safeMin}-{meta.safeMax}{meta.unit})
          </div>
        </div>
      </div>

      {/* Insights cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h4 className="font-black text-base">Trend Insight</h4>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            {selectedZone?.name} shows a {delta > 0 ? 'rising' : 'falling'} {meta.label.toLowerCase()} trend over the past 7 days ({Math.abs(delta).toFixed(1)}{meta.unit} change). {isInRange
              ? 'Current value remains within safe range, but monitor closely.'
              : 'Current value is outside safe range — review recommended actions in the Alerts screen.'}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <h4 className="font-black text-base">Recommended Action</h4>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            {selectedMetric === 'humidity' && delta > 0 ? 'Increase night ventilation. Inspect grain surface for early mould.' :
             selectedMetric === 'temperature' && delta > 0 ? 'Move bin to shaded area. Reduce daytime sun exposure.' :
             selectedMetric === 'co2' && delta > 0 ? 'Check for insect activity. Apply preventive diatomaceous earth.' :
             selectedMetric === 'moisture' && delta > 0 ? 'Sun-dry grain to 12%wb or below before continuing storage.' :
             'Trend is stable. Continue current monitoring routine.'}
          </p>
        </div>
      </div>

      {/* Source citation */}
      <div className="bg-stone-100 dark:bg-stone-900 p-4 rounded-2xl text-center">
        <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
          Safe thresholds per FAO Post-Harvest Operations Manual & TNAU Agritech Portal · IS 1155 Indian Standard
        </p>
      </div>
    </div>
  );
};

export default History;
