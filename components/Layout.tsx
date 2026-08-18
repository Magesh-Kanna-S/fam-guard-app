
import React, { useState } from 'react';
import { AppScreen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  title: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  /** Global alert badge count */
  alertCount: number;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen,
  setScreen,
  title,
  theme,
  onToggleTheme,
  onLogout,
  alertCount
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Primary nav — always visible in the bottom bar on mobile (5 items max
  // so the bar doesn't overflow on small screens).
  const navItems = [
    { screen: AppScreen.DASHBOARD, icon: 'fa-house', label: 'Home' },
    { screen: AppScreen.ZONES, icon: 'fa-layer-group', label: 'Zones' },
    { screen: AppScreen.ALERTS, icon: 'fa-triangle-exclamation', label: 'Alerts', badge: alertCount },
    { screen: AppScreen.INVENTORY, icon: 'fa-warehouse', label: 'Grain' },
    { screen: AppScreen.VENTILATION, icon: 'fa-fan', label: 'Vent' },
  ];

  // Secondary nav — shown in top nav on desktop, in the hamburger drawer on
  // mobile/tablet.
  const secondaryNav = [
    { screen: AppScreen.ADVISORY_CHAT, icon: 'fa-message', label: 'Ask AI', desc: 'Get storage advice from FAM-GUARD AI' },
    { screen: AppScreen.HISTORY, icon: 'fa-chart-line', label: 'Trends', desc: 'Sensor history & spoilage predictions' },
    { screen: AppScreen.FARM_MANAGEMENT, icon: 'fa-people-group', label: 'Farm', desc: 'Manage members & access' },
    { screen: AppScreen.SUBSCRIPTION, icon: 'fa-crown', label: 'Plan', desc: 'Upgrade to Plus or Pro' },
    { screen: AppScreen.SETTINGS, icon: 'fa-gear', label: 'Setup', desc: 'Profile, language, offline mode' },
  ];

  if (activeScreen === AppScreen.ONBOARDING) {
    return <div className="min-h-screen bg-white dark:bg-stone-950">{children}</div>;
  }

  const handleDrawerNav = (screen: AppScreen) => {
    setScreen(screen);
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950 relative overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex items-center justify-between sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto w-full flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen(AppScreen.DASHBOARD)}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[var(--color-brand-forest)] flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <i className="fa-solid fa-warehouse text-[var(--color-brand-amber)] text-lg md:text-2xl"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight uppercase leading-none">
                {title}
              </h1>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-brand-leaf)] dark:text-[var(--color-brand-amber)]">
                FAM-GUARD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop nav (full) — lg breakpoint and up */}
            <nav className="hidden lg:flex gap-1 mr-2">
              {navItems.map((item) => (
                <button
                  key={item.screen}
                  onClick={() => setScreen(item.screen)}
                  className={`px-3 py-2 rounded-xl font-bold text-xs lg:text-sm transition-all flex items-center gap-2 relative ${
                    activeScreen === item.screen
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-[var(--color-brand-leaf)] dark:text-emerald-400'
                      : 'text-stone-500 dark:text-stone-400 hover:text-[var(--color-brand-leaf)] hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-1 inline-flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 px-1">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
              {secondaryNav.map((item) => (
                <button
                  key={item.screen}
                  onClick={() => setScreen(item.screen)}
                  className={`px-3 py-2 rounded-xl font-bold text-xs lg:text-sm transition-all flex items-center gap-2 ${
                    activeScreen === item.screen
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-[var(--color-brand-leaf)] dark:text-emerald-400'
                      : 'text-stone-500 dark:text-stone-400 hover:text-[var(--color-brand-leaf)] hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                  }`}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Hamburger / 3-line button — visible on mobile & tablet only */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[var(--color-brand-forest)] text-white border border-emerald-800 flex items-center justify-center shadow-md active:scale-90 transition-all hover:bg-[var(--color-brand-leaf)]"
              title="Open menu"
              aria-label="Open navigation menu"
            >
              <i className="fa-solid fa-bars text-base md:text-lg"></i>
            </button>

            <button
              onClick={onToggleTheme}
              className="hidden md:flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 items-center justify-center text-stone-700 dark:text-stone-200 shadow-sm active:scale-90 transition-all hover:bg-stone-200 dark:hover:bg-stone-700"
              title="Toggle Theme"
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-sm md:text-base`}></i>
            </button>

            <button
              onClick={onLogout}
              className="hidden md:flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 items-center justify-center text-red-500 dark:text-red-400 shadow-sm active:scale-90 transition-all hover:bg-red-100 dark:hover:bg-red-900/20"
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket text-sm md:text-base"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in drawer (mobile/tablet only) */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="lg:hidden fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white dark:bg-stone-900 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="px-5 py-5 bg-gradient-to-br from-[var(--color-brand-forest)] via-[var(--color-brand-leaf)] to-[var(--color-brand-forest)] text-white relative overflow-hidden">
              <i className="fa-solid fa-warehouse absolute -top-4 -right-4 text-white/10 text-[7rem] rotate-12 pointer-events-none"></i>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-200">Menu</p>
                  <h2 className="text-lg font-black leading-tight">FAM-GUARD</h2>
                  <p className="text-[10px] text-emerald-100/80 mt-0.5">Protecting Every Grain</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>
            </div>

            {/* Drawer body — all nav items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-3 pt-2 pb-1">Main</p>
              {navItems.map((item) => (
                <button
                  key={item.screen}
                  onClick={() => handleDrawerNav(item.screen)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeScreen === item.screen
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-[var(--color-brand-leaf)] dark:text-emerald-400'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-base w-5 text-center`}></i>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="inline-flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] px-1.5">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}

              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-3 pt-3 pb-1">More</p>
              {secondaryNav.map((item) => (
                <button
                  key={item.screen}
                  onClick={() => handleDrawerNav(item.screen)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeScreen === item.screen
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-[var(--color-brand-leaf)] dark:text-emerald-400'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-base w-5 text-center mt-0.5`}></i>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.screen === AppScreen.SUBSCRIPTION && (
                        <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">PRO</span>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Drawer footer — theme + logout */}
            <div className="p-3 border-t border-stone-200 dark:border-stone-800 flex gap-2">
              <button
                onClick={onToggleTheme}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-xs active:scale-95 transition-all"
              >
                <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
              <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 font-bold text-xs active:scale-95 transition-all"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-12 overflow-y-auto scroll-smooth no-scrollbar">
        {children}
      </main>

      {/* Bottom nav (mobile only) — primary 5 tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 flex justify-around items-center py-2 safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40 rounded-t-3xl">
        {navItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => setScreen(item.screen)}
            className={`flex flex-col items-center justify-center px-3 py-2 transition-all duration-300 relative ${
              activeScreen === item.screen
                ? 'text-[var(--color-brand-leaf)] dark:text-emerald-400 scale-110'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {activeScreen === item.screen && (
              <div className="absolute -top-1 w-1 h-1 bg-[var(--color-brand-leaf)] dark:bg-emerald-400 rounded-full"></div>
            )}
            <div className="relative">
              <i className={`fa-solid ${item.icon} text-lg mb-1`}></i>
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center bg-red-500 text-white text-[8px] font-black rounded-full min-w-[14px] h-[14px] px-1">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
