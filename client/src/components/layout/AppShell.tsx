import * as React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from 'sonner';
import { LayoutDashboard, UtensilsCrossed, Sparkles, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AppShell() {
  const mobileNavItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/meals', label: 'Histórico', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { to: '/recommendations', label: 'Sugestões IA', icon: <Sparkles className="w-5 h-5" /> },
    { to: '/goals', label: 'Metas', icon: <Target className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-100 selection:bg-green-500 selection:text-black">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F172A]/95 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around px-2 z-40">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-green-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #334155',
            borderRadius: '1rem',
          },
        }}
      />
    </div>
  );
}
