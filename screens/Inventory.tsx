
import React, { useState } from 'react';
import { GrainLot, Zone, CropType } from '../types';

interface InventoryProps {
  lots: GrainLot[];
  zones: Zone[];
  onAddLot: (lot: GrainLot) => void;
  onRemoveLot: (lotId: string) => void;
}

const cropIcons: Record<CropType, string> = {
  Paddy: 'fa-bowl-rice',
  Wheat: 'fa-wheat-awn',
  Maize: 'fa-corn',
  Ragi: 'fa-seedling',
  Bajra: 'fa-circle-dot',
  Pulses: 'fa-circle',
  Groundnut: 'fa-leaf',
  Soybean: 'fa-bean',
  Mixed: 'fa-layer-group',
};

const cropColors: Record<CropType, string> = {
  Paddy: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  Wheat: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  Maize: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  Ragi: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  Bajra: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
  Pulses: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
  Groundnut: 'bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400',
  Soybean: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400',
  Mixed: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400',
};

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function freshnessPct(lot: GrainLot): number {
  const elapsed = daysSince(lot.storageDate);
  return Math.max(0, Math.min(100, ((lot.expectedShelfLifeDays - elapsed) / lot.expectedShelfLifeDays) * 100));
}

const Inventory: React.FC<InventoryProps> = ({ lots, zones, onAddLot, onRemoveLot }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLot, setNewLot] = useState<Partial<GrainLot>>({
    crop: 'Paddy',
    quantityKg: 100,
    variety: '',
    moistureAtStorage: 12,
    expectedShelfLifeDays: 180,
    zoneId: zones[0]?.id || '',
  });

  const totalKg = lots.reduce((s, l) => s + l.quantityKg, 0);
  const avgMoisture = lots.length ? (lots.reduce((s, l) => s + l.moistureAtStorage, 0) / lots.length).toFixed(1) : '0';
  const certifiedCount = lots.filter(l => l.isCertified).length;

  const handleAdd = () => {
    if (!newLot.crop || !newLot.quantityKg || !newLot.zoneId) {
      alert('Please fill all required fields.');
      return;
    }
    const lot: GrainLot = {
      id: `lot-${Date.now()}`,
      crop: newLot.crop as CropType,
      variety: newLot.variety || '',
      quantityKg: Number(newLot.quantityKg),
      harvestDate: new Date().toISOString(),
      storageDate: new Date().toISOString(),
      zoneId: newLot.zoneId,
      moistureAtStorage: Number(newLot.moistureAtStorage),
      expectedShelfLifeDays: Number(newLot.expectedShelfLifeDays),
      isCertified: false,
      lotCode: `${newLot.crop?.slice(0, 3).toUpperCase()}-2026-${String(lots.length + 1).padStart(3, '0')}`,
    };
    onAddLot(lot);
    setShowAddForm(false);
    setNewLot({ crop: 'Paddy', quantityKg: 100, variety: '', moistureAtStorage: 12, expectedShelfLifeDays: 180, zoneId: zones[0]?.id || '' });
  };

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto animate-in fade-in duration-500 text-stone-900 dark:text-stone-100 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-3xl font-black tracking-tight">Grain Inventory</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium mt-1">Track each lot from harvest to consumption.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[var(--color-brand-forest)] text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 hover:bg-[var(--color-brand-leaf)] transition-all shadow-lg"
        >
          <i className={`fa-solid ${showAddForm ? 'fa-xmark' : 'fa-plus'}`}></i>
          {showAddForm ? 'Cancel' : 'Register New Lot'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Stock</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">{totalKg.toLocaleString()}<span className="text-xs ml-1">kg</span></p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Active Lots</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">{lots.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Avg Moisture</p>
          <p className="text-2xl font-black text-stone-900 dark:text-white mt-1">{avgMoisture}<span className="text-xs ml-1">%wb</span></p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Certified Lots</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{certifiedCount}<span className="text-xs ml-1 text-stone-500">/{lots.length}</span></p>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="card p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <h4 className="text-lg font-black uppercase tracking-widest text-[var(--color-brand-leaf)]">Register New Grain Lot</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Crop</label>
              <select value={newLot.crop} onChange={(e) => setNewLot({ ...newLot, crop: e.target.value as CropType })} className="input-field">
                {Object.keys(cropIcons).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Variety</label>
              <input value={newLot.variety || ''} onChange={(e) => setNewLot({ ...newLot, variety: e.target.value })} placeholder="e.g. CR-1009" className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Quantity (kg)</label>
              <input type="number" value={newLot.quantityKg} onChange={(e) => setNewLot({ ...newLot, quantityKg: Number(e.target.value) })} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Storage Zone</label>
              <select value={newLot.zoneId} onChange={(e) => setNewLot({ ...newLot, zoneId: e.target.value })} className="input-field">
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Moisture %wb</label>
              <input type="number" step="0.1" value={newLot.moistureAtStorage} onChange={(e) => setNewLot({ ...newLot, moistureAtStorage: Number(e.target.value) })} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Expected Shelf Life (days)</label>
              <input type="number" value={newLot.expectedShelfLifeDays} onChange={(e) => setNewLot({ ...newLot, expectedShelfLifeDays: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <button onClick={handleAdd} className="btn-primary w-full py-4">Register Lot</button>
        </div>
      )}

      {/* Lot cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lots.map(lot => {
          const zone = zones.find(z => z.id === lot.zoneId);
          const elapsed = daysSince(lot.storageDate);
          const fresh = freshnessPct(lot);
          const freshColor = fresh > 60 ? 'text-emerald-600 dark:text-emerald-400' : fresh > 25 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
          const freshBar = fresh > 60 ? 'bg-emerald-500' : fresh > 25 ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={lot.id} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${cropColors[lot.crop]} flex items-center justify-center shrink-0`}>
                  <i className={`fa-solid ${cropIcons[lot.crop]} text-2xl`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-stone-900 dark:text-white text-lg">{lot.crop}</h4>
                    {lot.variety && <span className="text-xs text-stone-500 font-medium">· {lot.variety}</span>}
                    {lot.isCertified && (
                      <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                        <i className="fa-solid fa-certificate mr-1"></i>Certified
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-0.5">
                    {lot.lotCode} · {zone?.name || 'Unassigned'}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveLot(lot.id)}
                  className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center active:scale-90"
                  title="Remove lot"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>

              {/* Freshness bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-stone-500">Freshness Remaining</span>
                  <span className={freshColor}>{Math.round(fresh)}% · ~{Math.max(0, lot.expectedShelfLifeDays - elapsed)} days left</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className={`h-full ${freshBar} transition-all`} style={{ width: `${fresh}%` }}></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Quantity</p>
                  <p className="text-sm font-black text-stone-900 dark:text-white">{lot.quantityKg}<span className="text-[10px] ml-0.5 text-stone-500">kg</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Stored</p>
                  <p className="text-sm font-black text-stone-900 dark:text-white">{elapsed}<span className="text-[10px] ml-0.5 text-stone-500">days ago</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Moisture</p>
                  <p className={`text-sm font-black ${lot.moistureAtStorage > 14 ? 'text-red-600 dark:text-red-400' : 'text-stone-900 dark:text-white'}`}>{lot.moistureAtStorage}<span className="text-[10px] ml-0.5 text-stone-500">%wb</span></p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;
