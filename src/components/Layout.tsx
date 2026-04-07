import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Sparkles, Smile, User } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: Home, path: '/dashboard', label: 'Home' },
  { icon: Calendar, path: '/calendar', label: 'Kalender' },
  { icon: Sparkles, path: '/ai', label: 'Serein AI' },
  { icon: Smile, path: '/mood', label: 'Mood' },
  { icon: User, path: '/profile', label: 'Profil' },
];

export default function Layout({ user }: { user: any }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ['/', '/auth', '/onboarding'].includes(location.pathname);

  if (isAuthPage) return <Outlet />;

  return (
    <div className="min-h-screen bg-surface pb-32">
      <Outlet />
      
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="bg-white/75 dark:bg-rose-900/75 backdrop-blur-lg rounded-full shadow-[0_8px_24px_rgba(194,80,110,0.12)] flex justify-around items-center px-4 h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "p-3 transition-all duration-300 rounded-full",
                  isActive 
                    ? "bg-tertiary-fixed text-primary shadow-inner scale-110" 
                    : "text-secondary hover:scale-110"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
