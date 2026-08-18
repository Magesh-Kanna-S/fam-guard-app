
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './screens/Login';
import Welcome from './screens/Welcome';
import Onboarding from './screens/Onboarding';
import Dashboard from './screens/Dashboard';
import Zones from './screens/Zones';
import Alerts from './screens/Alerts';
import Inventory from './screens/Inventory';
import Ventilation from './screens/Ventilation';
import AdvisoryChat from './screens/AdvisoryChat';
import History from './screens/History';
import Subscription from './screens/Subscription';
import FarmManagement from './screens/FarmManagement';
import ProfileEdit from './screens/ProfileEdit';
import Settings from './screens/Settings';
import { AppScreen, UserProfile, Zone, GrainLot, AlertEvent, FarmMember } from './types';
import { SEED_ZONES, SEED_INVENTORY, SEED_ALERTS, makeDefaultProfile } from './services/seedData';

const STORAGE_KEY = 'fam_guard_user_data';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [zones, setZones] = useState<Zone[]>(SEED_ZONES);
  const [inventory, setInventory] = useState<GrainLot[]>(SEED_INVENTORY);
  const [alerts, setAlerts] = useState<AlertEvent[]>(SEED_ALERTS);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn && parsed.profile) {
          setProfile(parsed.profile);
          if (parsed.zones) setZones(parsed.zones);
          if (parsed.inventory) setInventory(parsed.inventory);
          if (parsed.alerts) setAlerts(parsed.alerts);
          setActiveScreen(parsed.completedOnboarding ? AppScreen.WELCOME : AppScreen.ONBOARDING);
        }
      } catch (e) {
        console.error('Restore error', e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isLoggedIn: true,
        profile,
        zones,
        inventory,
        alerts,
        completedOnboarding: profile.farmName !== 'Vishnu Family Farm' || profile.pairedDeviceId !== undefined,
      }));

      // Apply theme
      if (profile.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [profile, zones, inventory, alerts]);

  const toggleTheme = () => {
    if (!profile) return;
    setProfile({ ...profile, theme: profile.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleLogout = () => {
    if (window.confirm('Logout from FAM-GUARD? You can log back in with the same phone number.')) {
      localStorage.removeItem(STORAGE_KEY);
      setProfile(null);
      setZones(SEED_ZONES);
      setInventory(SEED_INVENTORY);
      setAlerts(SEED_ALERTS);
      setActiveScreen(AppScreen.LOGIN);
    }
  };

  const handleLoginComplete = (data: { method: 'Google' | 'Phone'; name: string; phone?: string }) => {
    const initial = makeDefaultProfile(data.name, data.phone);
    initial.authMethod = data.method;
    setProfile(initial);
    setActiveScreen(AppScreen.ONBOARDING);
  };

  const handleOnboardingComplete = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
    setActiveScreen(AppScreen.WELCOME);
  };

  // Re-aggregate profile counters whenever zones change
  useEffect(() => {
    if (!profile) return;
    setProfile(prev => prev ? {
      ...prev,
      totalZones: zones.length,
      totalGrainKg: zones.reduce((s, z) => s + z.filledKg, 0),
      safeZones: zones.filter(z => z.risk === 'SAFE').length,
      checkZones: zones.filter(z => z.risk === 'CHECK').length,
      actionZones: zones.filter(z => z.risk === 'ACTION').length,
    } : prev);
  }, [zones]);

  const handleOpenZone = (zoneId: string) => {
    setActiveScreen(AppScreen.ZONES);
    // Auto-open zone detail via state lifted in Zones component itself
  };

  const handleToggleVentilation = (zoneId: string) => {
    setZones(prev => prev.map(z => {
      if (z.id !== zoneId) return z;
      const next = z.ventilation === 'AUTO' ? 'MANUAL_OFF'
        : z.ventilation === 'MANUAL_OFF' ? 'MANUAL_ON'
        : z.ventilation === 'MANUAL_ON' ? 'MANUAL_OFF'
        : 'AUTO';
      return { ...z, ventilation: next };
    }));
  };

  const handleSetAutoVentilation = (zoneId: string) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ventilation: 'AUTO' } : z));
  };

  const handleAddZone = () => {
    const id = `z${zones.length + 1}`;
    const newZone: Zone = {
      id,
      name: `New Zone ${zones.length + 1}`,
      location: 'Backyard',
      crop: 'Paddy',
      storageType: 'Metal Bin',
      capacityKg: 500,
      filledKg: 0,
      risk: 'SAFE',
      sensors: [
        { key: 'temperature', label: 'Temperature', value: 25, unit: '°C', safeMin: 15, safeMax: 27, icon: 'fa-temperature-half' },
        { key: 'humidity', label: 'Relative Humidity', value: 55, unit: '%', safeMin: 30, safeMax: 65, icon: 'fa-droplet' },
        { key: 'co2', label: 'CO₂ Level', value: 700, unit: 'ppm', safeMin: 350, safeMax: 1000, icon: 'fa-wind' },
        { key: 'moisture', label: 'Grain Moisture', value: 12, unit: '%wb', safeMin: 8, safeMax: 13, icon: 'fa-seedling' },
      ],
      ventilation: 'AUTO',
      lastUpdated: new Date().toISOString(),
      ventilationRuntimeMin: 0,
      safeDaysRemaining: 120,
      activeAlerts: 0,
    };
    setZones(prev => [...prev, newZone]);
    alert('New zone added. Edit it from the Zones screen.');
  };

  const handleAckAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const handleAckAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const handleAddLot = (lot: GrainLot) => {
    setInventory(prev => [...prev, lot]);
  };

  const handleRemoveLot = (lotId: string) => {
    setInventory(prev => prev.filter(l => l.id !== lotId));
  };

  const handleAddMember = (member: FarmMember) => {
    if (!profile) return;
    setProfile({ ...profile, farmMembers: [...profile.farmMembers, member] });
  };

  const handleRemoveMember = (id: string) => {
    if (!profile) return;
    setProfile({ ...profile, farmMembers: profile.farmMembers.filter(m => m.id !== id) });
  };

  const handleUpdateMember = (id: string, updates: Partial<FarmMember>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      farmMembers: profile.farmMembers.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const getTitle = () => {
    switch (activeScreen) {
      case AppScreen.DASHBOARD: return 'Dashboard';
      case AppScreen.ZONES: return 'Zones';
      case AppScreen.ALERTS: return 'Alerts';
      case AppScreen.INVENTORY: return 'Grain';
      case AppScreen.VENTILATION: return 'Ventilation';
      case AppScreen.ADVISORY_CHAT: return 'Ask AI';
      case AppScreen.HISTORY: return 'Trends';
      case AppScreen.SUBSCRIPTION: return 'Plan';
      case AppScreen.FARM_MANAGEMENT: return 'Farm';
      case AppScreen.PROFILE_EDIT: return 'Edit Profile';
      case AppScreen.SETTINGS: return 'Settings';
      default: return 'FAM-GUARD';
    }
  };

  const unackAlertCount = alerts.filter(a => !a.acknowledged).length;

  // Pre-login screens
  if (activeScreen === AppScreen.LOGIN) return <Login onLoginComplete={handleLoginComplete} />;
  if (activeScreen === AppScreen.WELCOME && profile) {
    return <Welcome onContinue={() => setActiveScreen(AppScreen.DASHBOARD)} userName={profile.name} zonesCount={zones.length} />;
  }

  if (activeScreen === AppScreen.ONBOARDING && profile) {
    return <Onboarding initialProfile={profile} onComplete={handleOnboardingComplete} />;
  }

  if (!profile) return <Login onLoginComplete={handleLoginComplete} />;

  // Advisory chat is full-screen (no Layout chrome around it)
  if (activeScreen === AppScreen.ADVISORY_CHAT) {
    return (
      <Layout
        activeScreen={activeScreen}
        setScreen={setActiveScreen}
        title={getTitle()}
        theme={profile.theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        alertCount={unackAlertCount}
      >
        <AdvisoryChat profile={profile} zones={zones} />
      </Layout>
    );
  }

  return (
    <Layout
      activeScreen={activeScreen}
      setScreen={setActiveScreen}
      title={getTitle()}
      theme={profile.theme}
      onToggleTheme={toggleTheme}
      onLogout={handleLogout}
      alertCount={unackAlertCount}
    >
      {activeScreen === AppScreen.DASHBOARD && (
        <Dashboard
          profile={profile}
          zones={zones}
          alerts={alerts}
          setScreen={setActiveScreen}
          onOpenZone={handleOpenZone}
          onAckAlert={handleAckAlert}
        />
      )}

      {activeScreen === AppScreen.ZONES && (
        <Zones
          zones={zones}
          onOpenZone={() => {}}
          onToggleVentilation={handleToggleVentilation}
          onAddZone={handleAddZone}
        />
      )}

      {activeScreen === AppScreen.ALERTS && (
        <Alerts alerts={alerts} onAck={handleAckAlert} onAckAll={handleAckAll} />
      )}

      {activeScreen === AppScreen.INVENTORY && (
        <Inventory
          lots={inventory}
          zones={zones}
          onAddLot={handleAddLot}
          onRemoveLot={handleRemoveLot}
        />
      )}

      {activeScreen === AppScreen.VENTILATION && (
        <Ventilation
          zones={zones}
          onToggleVentilation={handleToggleVentilation}
          onSetAuto={handleSetAutoVentilation}
          setScreen={setActiveScreen}
        />
      )}

      {activeScreen === AppScreen.HISTORY && <History zones={zones} />}

      {activeScreen === AppScreen.SUBSCRIPTION && (
        <Subscription
          profile={profile}
          onUpdate={(tier) => {
            setProfile({ ...profile, subscription: tier });
            alert(`Plan updated to FAM-GUARD ${tier}.`);
          }}
        />
      )}

      {activeScreen === AppScreen.FARM_MANAGEMENT && (
        <FarmManagement
          profile={profile}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onUpdateMember={handleUpdateMember}
          onClose={() => setActiveScreen(AppScreen.DASHBOARD)}
        />
      )}

      {activeScreen === AppScreen.PROFILE_EDIT && (
        <ProfileEdit
          profile={profile}
          onSave={(updated) => {
            setProfile({ ...profile, ...updated } as UserProfile);
            setActiveScreen(AppScreen.DASHBOARD);
            alert('Profile saved.');
          }}
          onClose={() => setActiveScreen(AppScreen.DASHBOARD)}
        />
      )}

      {activeScreen === AppScreen.SETTINGS && (
        <Settings
          profile={profile}
          onUpdate={(updates) => setProfile({ ...profile, ...updates } as UserProfile)}
          onClose={() => setActiveScreen(AppScreen.DASHBOARD)}
        />
      )}
    </Layout>
  );
};

export default App;
