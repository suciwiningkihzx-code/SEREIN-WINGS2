import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, doc, getDoc, collection, addDoc } from '../lib/firebase';
import { Save, Bell, Heart, Thermometer, MessageSquare, Sparkles } from 'lucide-react';
import { MOODS, SYMPTOMS } from '../constants';
import { cn, getCyclePhase } from '../lib/utils';
import Alert from '../components/Alert';

export default function MoodScreen() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState('good');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Kram']);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not found');

      // Fetch cycle profile to calculate phase
      const cycleDoc = await getDoc(doc(db, 'cycle_profiles', user.uid));
      const cycleData = cycleDoc.data();

      let phase = 'Unknown';
      if (cycleData) {
        const last = new Date(cycleData.last_period_start);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - last.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dayInCycle = (diffDays % cycleData.avg_cycle_length) || cycleData.avg_cycle_length;
        
        phase = getCyclePhase(dayInCycle, cycleData.avg_cycle_length, cycleData.avg_period_duration);
      }

      const moodScore = MOODS.find(m => m.value === selectedMood)?.score || 3;

      await addDoc(collection(db, 'mood_logs'), {
        user_id: user.uid,
        logged_date: new Date().toISOString().split('T')[0],
        mood_score: moodScore,
        symptoms: selectedSymptoms,
        journal_text: notes,
        cycle_phase: phase,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
      <Alert message={error} onClose={() => setError(null)} />
      <header className="bg-surface/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-container flex items-center justify-center">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Mascot" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-serif italic text-2xl text-primary">Serein Wings</h1>
        </div>
        <Bell className="text-primary w-6 h-6" />
      </header>

      <section className="flex justify-between items-end">
        <div>
          <h2 className="font-sans font-bold text-3xl text-primary leading-tight">Mood Tracker</h2>
          <p className="text-on-surface-variant font-medium mt-1">
            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2">
          <span className="text-sm font-bold text-primary">7 hari berturut-turut</span>
          <span className="text-lg">🔥</span>
        </div>
      </section>

      {/* Mood Selector */}
      <section className="space-y-4">
        <h3 className="font-sans font-semibold text-lg text-secondary px-1">Bagaimana perasaanmu?</h3>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((mood) => (
            <button 
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
                selectedMood === mood.value 
                  ? "bg-white ring-2 ring-primary ring-offset-2 shadow-lg scale-105" 
                  : "bg-surface-container-low scale-95 opacity-60"
              )}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className={cn(
                "text-[10px] leading-tight text-center",
                selectedMood === mood.value ? "font-bold text-primary" : "font-medium text-on-surface-variant"
              )}>{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Symptom Tags */}
      <section className="space-y-4">
        <h3 className="font-sans font-semibold text-lg text-secondary px-1">Ada keluhan fisik?</h3>
        <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
          {SYMPTOMS.map((symptom) => (
            <button 
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={cn(
                "whitespace-nowrap px-6 py-2.5 rounded-full font-medium text-sm transition-all active:scale-95",
                selectedSymptoms.includes(symptom)
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container-lowest text-on-secondary-container"
              )}
            >
              {symptom}
            </button>
          ))}
        </div>
      </section>

      {/* Journal & AI Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-semibold text-secondary">Catatan Harian</h3>
            <span className="text-[10px] text-outline font-medium">{notes.length}/500</span>
          </div>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            className="w-full h-32 bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded-lg p-4 text-sm placeholder:text-outline-variant font-body resize-none" 
            placeholder="Tulis perasaanmu hari ini..."
          />
        </div>

        <div className="bg-tertiary-fixed p-6 rounded-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 transform group-hover:scale-110 transition-transform">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Mascot" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
              <Sparkles className="text-tertiary w-5 h-5" />
            </div>
            <span className="font-sans font-bold text-on-tertiary-fixed text-sm uppercase tracking-wider">Insight Serein</span>
          </div>
          <p className="text-on-tertiary-fixed-variant font-medium leading-relaxed relative z-10">
            Kamu biasanya lebih emosional di hari ke-2 haid. Cobalah meditasi 5 menit hari ini! ✨
          </p>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-[10px] font-bold text-tertiary bg-white/40 px-2 py-0.5 rounded-full">Tips Cerdas AI</span>
          </div>
        </div>
      </section>

      {/* Primary CTA */}
      <section className="pb-12">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary text-white py-5 rounded-full font-sans font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 pearl-texture disabled:opacity-50"
        >
          <span>{loading ? 'Menyimpan...' : 'Simpan Mood'}</span>
          <Save className="w-6 h-6" />
        </button>
      </section>
    </main>
  );
}
