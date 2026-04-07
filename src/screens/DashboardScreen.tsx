import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, doc, setDoc, collection, addDoc, onSnapshot } from '../lib/firebase';
import { Bell, Droplets, Moon, Sparkles, Package } from 'lucide-react';
import { cn, getCyclePhase } from '../lib/utils';
import { MOODS, PRIMARY_COLOR } from '../constants';
import { GoogleGenAI } from '@google/genai';
import Alert from '../components/Alert';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiTip, setAiTip] = useState('Sedang memikirkan tips untukmu...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let userData: any = null;
    let cycleData: any = null;

    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        userData = doc.data();
        updateProfile();
      }
    });

    const unsubCycle = onSnapshot(doc(db, 'cycle_profiles', user.uid), (doc) => {
      if (doc.exists()) {
        cycleData = doc.data();
        updateProfile();
      } else {
        navigate('/onboarding');
      }
      setLoading(false);
    }, (err) => {
      console.error('Cycle profile fetch error:', err);
      setError(err.message);
      setLoading(false);
    });

    const updateProfile = () => {
      if (userData && cycleData) {
        const combined = { ...userData, ...cycleData };
        setProfile(combined);
        generateAiTip(combined);
      }
    };

    return () => {
      unsubUser();
      unsubCycle();
    };
  }, [navigate]);

  const handleLogPeriod = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !profile) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Save to period_logs
      await addDoc(collection(db, 'period_logs'), {
        user_id: user.uid,
        start_date: today
      });

      // Update cycle_profiles last_period_start
      await setDoc(doc(db, 'cycle_profiles', user.uid), {
        last_period_start: today
      }, { merge: true });

    } catch (err: any) {
      console.error('Error logging period:', err);
      setError(err.message);
    }
  };

  const generateAiTip = async (profileData: any) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('placeholder')) {
      console.warn('GEMINI_API_KEY is missing or invalid.');
      setAiTip('Perbanyak minum air hangat dan istirahat cukup ya! ✨');
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const dayInCycle = calculateDayInCycle(profileData.last_period_start, profileData.avg_cycle_length);
      const phase = getCyclePhase(dayInCycle, profileData.avg_cycle_length, profileData.avg_period_duration);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Kamu adalah Serein AI, asisten kesehatan wanita yang ramah dan suportif. 
        Berikan 1 tips singkat (maks 20 kata) dalam Bahasa Indonesia untuk pengguna yang sedang berada di fase ${phase} (hari ke-${dayInCycle} dari siklus ${profileData.avg_cycle_length} hari). 
        Gunakan emoji yang lucu.`,
      });
      setAiTip(response.text || 'Tetap semangat hari ini! ✨');
    } catch (error) {
      console.error('AI Error:', error);
      setAiTip('Perbanyak minum air hangat dan istirahat cukup ya! ✨');
    }
  };

  const calculateDayInCycle = (lastDate: string, length: number) => {
    const last = new Date(lastDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays % length) || length;
  };

  if (loading) return null;
  if (!profile) return null;

  const dayInCycle = calculateDayInCycle(profile.last_period_start, profile.avg_cycle_length);
  const phase = getCyclePhase(dayInCycle, profile.avg_cycle_length, profile.avg_period_duration);
  const daysUntilNext = profile.avg_cycle_length - dayInCycle;

  return (
    <main className="pt-24 px-6 space-y-8 max-w-2xl mx-auto">
      <Alert message={error} onClose={() => setError(null)} />
      <header className="bg-surface/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-sans font-semibold text-lg text-primary">Halo, {profile.name.split(' ')[0]} 🌸</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50/50 transition-colors">
          <Bell className="text-primary w-6 h-6" />
        </button>
      </header>

      {/* Hero Card: Cycle Halo */}
      <section className="relative bg-surface-container-lowest rounded-lg p-8 text-center shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <h2 className="font-sans font-bold text-on-surface-variant mb-6 text-sm tracking-wide uppercase">Siklus Kamu</h2>
        
        <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-8 border-surface-container-low" />
          <div 
            className="absolute inset-0 rounded-full border-8 border-transparent cycle-halo-gradient opacity-80" 
            style={{ 
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'destination-out',
              maskComposite: 'exclude',
              transform: `rotate(${(dayInCycle / profile.avg_cycle_length) * 360}deg)`
            }} 
          />
          <div className="flex flex-col items-center">
            <span className="text-primary font-sans font-extrabold text-4xl">Hari ke-{dayInCycle}</span>
            <span className="text-on-secondary-container font-medium text-sm mt-1">Fase {phase}</span>
          </div>
          <div className="absolute -top-4 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-md uppercase">
            {phase}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-secondary font-medium italic text-lg font-serif">
            Haid berikutnya {daysUntilNext} hari lagi 💫
          </p>
          <button 
            onClick={handleLogPeriod}
            className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg pearl-texture hover:scale-105 active:scale-95 transition-all"
          >
            Catat Haid Hari Ini
          </button>
        </div>
      </section>

      {/* Quick Mood Strip */}
      <section className="space-y-4">
        <h3 className="font-sans font-semibold text-on-surface ml-2">Mood hari ini?</h3>
        <div className="flex justify-between items-center bg-surface-container-low rounded-full px-6 py-4">
          {MOODS.map((mood) => (
            <button 
              key={mood.value}
              onClick={() => navigate('/mood')}
              className="flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-90"
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[10px] font-medium text-outline">{mood.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* AI Tip Banner */}
      <section className="relative bg-tertiary/10 rounded-lg p-6 flex items-start gap-4 overflow-hidden">
        <div className="relative z-10 w-16 h-16 shrink-0 transform -rotate-6">
          <img 
            src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
            alt="Serein AI" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Serein AI</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-tr-xl rounded-br-xl rounded-bl-xl p-4 shadow-sm">
            <p className="text-on-secondary-container font-medium text-sm leading-relaxed">
              {aiTip}
            </p>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-tertiary opacity-10 rounded-full blur-2xl" />
      </section>

      {/* Subscription Status Card */}
      <section 
        onClick={() => navigate('/subscription')}
        className="bg-white/70 backdrop-blur-md rounded-lg p-6 shadow-lg flex justify-between items-center group cursor-pointer transition-all hover:bg-white/90"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="text-primary w-5 h-5" />
            <h4 className="font-sans font-bold text-primary">Self Care Package 📦</h4>
          </div>
          <p className="text-secondary text-sm font-medium pl-7">Cek paket langgananmu</p>
        </div>
        <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center p-2 group-hover:rotate-6 transition-transform">
          <Sparkles className="text-primary w-8 h-8" />
        </div>
      </section>

      {/* Activity Grid */}
      <div className="grid grid-cols-2 gap-4 pb-12">
        <div className="bg-surface-container-lowest rounded-lg p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
            <Droplets className="text-primary w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-outline uppercase tracking-tighter">Hidrasi</h5>
            <p className="text-lg font-sans font-bold text-on-surface">1.2L / 2L</p>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[60%] rounded-full" />
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-lg p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <Moon className="text-tertiary w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-outline uppercase tracking-tighter">Tidur</h5>
            <p className="text-lg font-sans font-bold text-on-surface">7j 20m</p>
          </div>
          <p className="text-[10px] text-tertiary font-medium">Cukup baik!</p>
        </div>
      </div>
    </main>
  );
}
