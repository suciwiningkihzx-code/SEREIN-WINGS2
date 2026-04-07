import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, doc, setDoc, onSnapshot } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { User, Settings, LogOut, ChevronRight, History, CreditCard, Heart, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import Alert from '../components/Alert';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cycleProfile, setCycleProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const authUser = auth.currentUser;
    if (!authUser) return;

    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUser(data);
        setNewName(data.name || '');
      }
    });

    const unsubCycle = onSnapshot(doc(db, 'cycle_profiles', authUser.uid), (doc) => {
      if (doc.exists()) {
        setCycleProfile(doc.data());
      }
      setLoading(false);
    }, (err) => {
      console.error('Profile fetch error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => {
      unsubUser();
      unsubCycle();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('onboarding_complete');
      navigate('/auth');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateName = async () => {
    try {
      const authUser = auth.currentUser;
      if (!authUser) return;

      await setDoc(doc(db, 'users', authUser.uid), {
        name: newName
      }, { merge: true });
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return null;

  const menuItems = [
    { icon: History, label: 'Riwayat Haid', path: '/history', color: 'text-primary' },
    { icon: CreditCard, label: 'Langganan Saya', path: '/subscription', color: 'text-secondary' },
    { icon: Heart, label: 'Partner Saya', path: '/partner', color: 'text-rose-500' },
    { icon: Bell, label: 'Notifikasi', path: '#', color: 'text-amber-500' },
    { icon: Settings, label: 'Pengaturan', path: '#', color: 'text-slate-500' },
  ];

  return (
    <main className="pt-12 pb-32 px-6 max-w-2xl mx-auto space-y-8">
      <Alert message={error} onClose={() => setError(null)} />
      
      {/* Profile Header */}
      <section className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-4 border-white shadow-lg mx-auto">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          {isEditing ? (
            <div className="flex items-center justify-center gap-2">
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-surface-container-low border-none rounded-full px-4 py-1 text-center font-bold text-xl focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={handleUpdateName} className="text-primary font-bold">Simpan</button>
            </div>
          ) : (
            <h2 className="text-2xl font-sans font-bold text-primary flex items-center justify-center gap-2">
              {user?.name}
              <button onClick={() => setIsEditing(true)} className="text-outline hover:text-primary transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </h2>
          )}
          <p className="text-on-surface-variant font-medium">Siklus rata-rata: {cycleProfile?.avg_cycle_length} hari</p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm text-center space-y-1">
          <span className="text-xs font-bold text-outline uppercase tracking-widest">Durasi Haid</span>
          <p className="text-2xl font-sans font-extrabold text-primary">{cycleProfile?.avg_period_duration} Hari</p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm text-center space-y-1">
          <span className="text-xs font-bold text-outline uppercase tracking-widest">Status</span>
          <p className="text-2xl font-sans font-extrabold text-secondary">Aktif</p>
        </div>
      </section>

      {/* Menu List */}
      <section className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
        {menuItems.map((item, i) => (
          <button 
            key={i}
            onClick={() => item.path !== '#' && navigate(item.path)}
            className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-0"
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-on-surface">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </button>
        ))}
      </section>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full py-4 rounded-full border-2 border-rose-100 text-rose-500 font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Keluar Akun
      </button>

      <p className="text-center text-[10px] text-outline font-medium">Serein Wings v1.0.0 • Dibuat dengan ❤️ untukmu</p>
    </main>
  );
}
