import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBondhuStore } from '../store/useBondhuStore';
import { XpNotification } from './XpNotification';
import { Onboarding } from './Onboarding';
import { Home, LayoutDashboard, Users, Gamepad2, Briefcase, Menu, X, Flame, LogOut, Book, Layers } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
        ? 'bg-bondhu-light text-bondhu-red font-medium'
        : 'text-slate-600 hover:text-bondhu-red hover:bg-slate-50'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, checkStreak } = useBondhuStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check streak on app load if user exists
  useEffect(() => {
    if (user.name) {
      checkStreak();
    }
  }, [user.name]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Onboarding />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-bondhu-red text-white p-1.5 rounded-lg font-bold text-xl">B</div>
                <span className="font-bold text-2xl tracking-tight text-slate-800">Bondhu</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              <NavItem to="/" icon={Home} label="Home" />
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/coaching" icon={Users} label="Coaching" />
              <NavItem to="/community" icon={Users} label="Community" />
              <NavItem to="/arcade" icon={Gamepad2} label="Arcade" />
              <NavItem to="/toolkit" icon={Briefcase} label="Toolkit" />
              <NavItem to="/journal" icon={Book} label="Journal" />
              <NavItem to="/resources" icon={Layers} label="Resources" />
            </div>

            {/* User Badge */}
            <div className="hidden md:flex items-center gap-4">
              {user.name && (
                <>
                  <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold border border-orange-200">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
                    {user.streak} Day Streak
                  </div>
                  <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">Lvl {user.level} • {user.xp} XP</p>
                    </div>
                    <div className="w-10 h-10 bg-bondhu-red rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={() => useBondhuStore.getState().logout()}
                      className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full z-50 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/" icon={Home} label="Home" />
              <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/coaching" icon={Users} label="Coaching" />
              <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/community" icon={Users} label="Community" />
              <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/arcade" icon={Gamepad2} label="Arcade" />
              <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/toolkit" icon={Briefcase} label="Toolkit" />
              <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/journal" icon={Book} label="Journal" />
              <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/resources" icon={Layers} label="Resources" />
            </div>
            {user.name && (
              <div className="pt-4 pb-4 border-t border-slate-200 px-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bondhu-red rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{user.name}</div>
                      <div className="text-sm text-slate-500">Level {user.level} • {user.xp} XP</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      useBondhuStore.getState().logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 text-slate-500 hover:text-red-500 bg-white border border-slate-200 rounded-lg shadow-sm"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {children}
      </main>

      <XpNotification />
    </div>
  );
};