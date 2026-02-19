import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Receipt } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/budgets', label: 'Budgets', icon: Receipt },
    { href: '/expenses/new', label: 'New Expense', icon: PlusCircle },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 glass hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-primary bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            <Receipt className="w-8 h-8 text-blue-400" />
            Lumina Finance
          </h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname === item.href;
             return (
               <Link
                 key={item.href}
                 to={item.href}
                 className={cn(
                   "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                   isActive 
                     ? "bg-primary/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                     : "text-gray-400 hover:text-white hover:bg-white/5"
                 )}
               >
                 <Icon className="w-5 h-5" />
                 {item.label}
               </Link>
             )
          })}
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive mt-8 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.first_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <h1 className="font-bold">Expense Tracker</h1>
            <div className="flex gap-2">
                <Link to="/expenses/new"><PlusCircle /></Link>
                 <button onClick={logout}><LogOut /></button>
            </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
             <Outlet />
        </div>
      </main>
    </div>
  );
}
