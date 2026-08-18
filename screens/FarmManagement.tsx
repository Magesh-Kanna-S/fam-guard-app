
import React, { useState } from 'react';
import { UserProfile, FarmMember } from '../types';

interface FarmManagementProps {
  profile: UserProfile;
  onAddMember: (m: FarmMember) => void;
  onRemoveMember: (id: string) => void;
  onUpdateMember: (id: string, updates: Partial<FarmMember>) => void;
  onClose: () => void;
}

const roles: FarmMember['role'][] = ['Owner', 'Co-Farmer', 'Worker', 'Family'];

const roleMeta: Record<FarmMember['role'], { icon: string; color: string; label: string }> = {
  Owner: { icon: 'fa-crown', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', label: 'Owner' },
  'Co-Farmer': { icon: 'fa-people-group', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', label: 'Co-Farmer' },
  Worker: { icon: 'fa-person-digging', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400', label: 'Worker' },
  Family: { icon: 'fa-house-user', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400', label: 'Family' },
};

const FarmManagement: React.FC<FarmManagementProps> = ({ profile, onAddMember, onRemoveMember, onUpdateMember, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<FarmMember['role']>('Co-Farmer');
  const [receivesAlerts, setReceivesAlerts] = useState(true);

  const handleAdd = () => {
    if (!name.trim()) {
      alert('Please enter a name.');
      return;
    }
    onAddMember({
      id: Date.now().toString(),
      name,
      phone,
      role,
      receivesAlerts,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    });
    setName('');
    setPhone('');
    setRole('Co-Farmer');
    setReceivesAlerts(true);
    alert(`${name} added to your farm profile.`);
  };

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto pb-10 animate-in fade-in duration-500 text-stone-900 dark:text-stone-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black tracking-tight">Farm Members</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 font-medium mt-1">Add co-farmers, workers, or family members who help manage your storage.</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 transition-all">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add form */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="card p-8 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-[var(--color-brand-leaf)] dark:text-emerald-400 flex items-center justify-center shadow-inner border border-emerald-100 dark:border-emerald-800">
                <i className="fa-solid fa-user-plus text-2xl"></i>
              </div>
              <div>
                <h4 className="font-black text-2xl">Add Member</h4>
                <p className="text-xs text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">Grant App & Alert Access</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lakshmi Subramanian" className="input-field" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Phone (for SMS alerts)</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="input-field" maxLength={10} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 ml-2">Role</label>
                <div className="grid grid-cols-4 gap-2">
                  {roles.map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-3 rounded-xl border-2 text-center text-[10px] font-black uppercase tracking-widest transition-all ${
                        role === r
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-500'
                      }`}
                    >
                      <i className={`fa-solid ${roleMeta[r].icon} block mb-1`}></i>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-100 dark:border-stone-800">
                <div>
                  <p className="text-xs font-black text-stone-700 dark:text-stone-200">Receives SMS Alerts</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">For ACTION-level events only</p>
                </div>
                <button
                  onClick={() => setReceivesAlerts(!receivesAlerts)}
                  className={`relative w-12 h-7 rounded-full transition-all ${receivesAlerts ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'}`}
                >
                  <div className={`absolute top-1 bottom-1 w-5 rounded-full bg-white shadow-md transition-all ${receivesAlerts ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <button onClick={handleAdd} className="btn-primary w-full py-5">Add Farm Member</button>
            </div>
          </div>
        </div>

        {/* Members list */}
        <div className="space-y-4">
          <h4 className="font-black text-xl uppercase tracking-widest px-2">Current Members</h4>
          <div className="space-y-3">
            {profile.farmMembers.length === 0 ? (
              <div className="py-16 text-center bg-stone-50 dark:bg-stone-900/50 rounded-[2rem] border-2 border-dashed border-stone-200 dark:border-stone-800">
                <i className="fa-solid fa-users-viewfinder text-4xl text-stone-300 dark:text-stone-700 mb-3"></i>
                <p className="text-stone-400 dark:text-stone-500 font-black uppercase tracking-widest text-xs">No members yet.</p>
              </div>
            ) : (
              profile.farmMembers.map(member => {
                const meta = roleMeta[member.role];
                return (
                  <div key={member.id} className="card p-5 flex items-center justify-between hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-black text-lg uppercase`}>
                        {member.initials}
                      </div>
                      <div>
                        <p className="font-black text-lg text-stone-900 dark:text-white">{member.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.color}`}>
                            <i className={`fa-solid ${meta.icon} mr-1`}></i>{meta.label}
                          </span>
                          {member.phone && <span className="text-[10px] text-stone-500 font-bold">+91 {member.phone}</span>}
                          {member.receivesAlerts && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <i className="fa-solid fa-bell text-[8px]"></i>Alerts ON
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateMember(member.id, { receivesAlerts: !member.receivesAlerts })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${member.receivesAlerts ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'}`}
                        title="Toggle alerts"
                      >
                        <i className="fa-solid fa-bell text-xs"></i>
                      </button>
                      {member.role !== 'Owner' && (
                        <button
                          onClick={() => onRemoveMember(member.id)}
                          className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center border border-red-100 dark:border-red-900/30 active:scale-90"
                          title="Remove member"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmManagement;
