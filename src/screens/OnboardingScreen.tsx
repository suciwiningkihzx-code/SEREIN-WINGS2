import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, doc, setDoc } from '../lib/firebase';
import { Calendar, ArrowRight, Minus, Plus, Share2, Sparkles } from 'lucide-react';

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date().toISOString().split('T')[0]);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [partnerEmail, setPartnerEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;

      if (user) {
        // Save to cycle_profiles
        await setDoc(doc(db, 'cycle_profiles', user.uid), {
          user_id: user.uid,
          avg_cycle_length: cycleLength,
          avg_period_duration: periodDuration,
          last_period_start: lastPeriodDate,
        });

        // Save to partners if email provided
        if (partnerEmail) {
          await setDoc(doc(db, 'partners', user.uid), {
            user_id: user.uid,
            partner_name: partnerEmail.split('@')[0],
            partner_contact: partnerEmail,
            notify_period_start: true,
            notify_bad_mood: true,
            notify_cramps: true,
          });
        }
        
        // 1. Set flag to prevent loops (backup)
        localStorage.setItem('onboarding_complete', 'true');
        
        // 2. Navigate after success
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Profile save failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface p-6 pt-24">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-xl px-6 py-6 flex justify-between items-center">
        <h1 className="font-serif italic font-bold text-2xl text-primary tracking-tight">Serein Wings</h1>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-primary shadow-lg' : 'w-2 bg-outline-variant/30'
              }`}
            />
          ))}
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {step === 1 && (
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container-lowest p-8 rounded-lg shadow-xl space-y-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-sans text-2xl font-semibold mb-2">Ceritain siklus kamu 🌸</h2>
                <p className="text-on-surface-variant text-sm">Bantu Serein menghitung siklusmu dengan akurat.</p>
              </div>
              <img 
                src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
                alt="Mascot" 
                className="w-20 h-20 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-8">
              <div className="bg-surface-container-low p-6 rounded-lg">
                <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-4">Tanggal haid terakhir</span>
                <div className="flex items-center justify-between">
                  <input 
                    type="date" 
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="bg-transparent border-none text-lg font-medium focus:ring-0 w-full"
                  />
                  <Calendar className="text-primary w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-5 rounded-lg">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-3">Panjang Siklus</span>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setCycleLength(Math.max(21, cycleLength - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm"><Minus className="w-4 h-4" /></button>
                    <span className="text-xl font-bold">{cycleLength}</span>
                    <button onClick={() => setCycleLength(Math.min(45, cycleLength + 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm"><Plus className="w-4 h-4" /></button>
                  </div>
                  <span className="text-[10px] text-on-surface-variant block mt-2 text-center">Hari</span>
                </div>
                <div className="bg-surface-container-low p-5 rounded-lg">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-3">Durasi Haid</span>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setPeriodDuration(Math.max(2, periodDuration - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm"><Minus className="w-4 h-4" /></button>
                    <span className="text-xl font-bold">{periodDuration}</span>
                    <button onClick={() => setPeriodDuration(Math.min(14, periodDuration + 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm"><Plus className="w-4 h-4" /></button>
                  </div>
                  <span className="text-[10px] text-on-surface-variant block mt-2 text-center">Hari</span>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full h-14 bg-primary text-white rounded-full font-semibold pearl-texture shadow-lg flex items-center justify-center gap-2"
              >
                Lanjut <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container-lowest p-8 rounded-lg shadow-xl flex flex-col h-full"
          >
            <div className="text-center mb-8">
              <div className="inline-block relative mb-4">
                <div className="absolute inset-0 bg-secondary-container/30 blur-2xl rounded-full" />
                <img 
                  src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
                  alt="Mascot" 
                  className="w-36 h-36 object-contain relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="font-sans text-2xl font-semibold mb-2">Hubungkan orang tersayangmu 💌</h2>
              <p className="text-on-surface-variant text-sm px-4">Beri dia kabar tentang siklusmu agar dia lebih pengertian.</p>
            </div>

            <div className="space-y-4 mb-auto">
              <div className="relative group">
                <input 
                  type="email" 
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  className="w-full h-14 bg-surface-container-high rounded-full border-none px-6 pr-14 focus:ring-2 focus:ring-primary/20"
                  placeholder="Email Partner"
                />
              </div>
              <button className="w-full h-14 border-2 border-outline-variant/20 rounded-full flex items-center justify-center gap-3 text-secondary font-medium hover:bg-secondary-container/20 transition-colors">
                <Share2 className="w-5 h-5" />
                Kirim Link Undangan
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-10">
              <button 
                onClick={() => setStep(3)}
                className="w-full h-14 bg-primary text-white rounded-full font-semibold pearl-texture shadow-lg flex items-center justify-center gap-2"
              >
                Lanjut <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleSaveProfile()}
                className="w-full py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-colors"
              >
                Lewati dulu, atur nanti
              </button>
            </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container-lowest p-8 rounded-lg shadow-xl text-center space-y-8"
          >
            <div className="py-10">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="font-sans text-3xl font-bold mb-4">Semua Siap! ✨</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Terima kasih sudah berbagi. Serein siap menemanimu melewati hari-hari dengan lebih cerah dan tenang.
              </p>
            </div>

            <button 
              onClick={() => handleSaveProfile()}
              className="w-full h-14 bg-primary text-white rounded-full font-semibold pearl-texture shadow-lg"
            >
              Mulai Sekarang
            </button>
          </motion.section>
        )}
      </div>
    </main>
  );
}
