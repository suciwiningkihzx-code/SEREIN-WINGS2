import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db, doc, setDoc, onSnapshot } from '../lib/firebase';
import { Bell, CheckCircle, Lock, Mail, Share2, User, Edit3, Droplets, Heart, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import Alert from '../components/Alert';

export default function PartnerScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'partners', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfile(data);
        setPartnerEmail(data.partner_contact || '');
      }
      setLoading(false);
    }, (err) => {
      console.error('Partner fetch error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleUpdatePartner = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not found');

      await setDoc(doc(db, 'partners', user.uid), {
        user_id: user.uid,
        partner_name: partnerEmail.split('@')[0],
        partner_contact: partnerEmail,
        notify_period_start: profile?.notify_period_start ?? true,
        notify_bad_mood: profile?.notify_bad_mood ?? true,
        notify_cramps: profile?.notify_cramps ?? true,
      }, { merge: true });

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = async (key: string) => {
    const user = auth.currentUser;
    if (!user || !profile) return;

    try {
      await setDoc(doc(db, 'partners', user.uid), {
        [key]: !profile[key]
      }, { merge: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading && !profile) return null;

  return (
    <main className="px-6 pt-24 space-y-8 max-w-2xl mx-auto pb-32">
      <Alert message={error} onClose={() => setError(null)} />
      <header className="sticky top-0 z-50 bg-surface/70 backdrop-blur-xl flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-fixed shadow-sm">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Mascot" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-serif italic text-2xl text-primary">Serein Wings</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-primary hover:bg-rose-50/50 transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </header>

      <section className="space-y-2">
        <h2 className="text-3xl font-sans font-extrabold text-primary tracking-tight leading-tight">Untuk Orang Tersayangmu 💌</h2>
        <p className="text-on-surface-variant font-medium text-lg">Biarkan mereka tau tanpa harus kamu cerita sendiri</p>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {/* Partner Card */}
        <div className="glass-card rounded-lg p-6 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                <User className="w-8 h-8 text-outline" />
              </div>
              {profile?.partner_email && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 fill-current" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-sans font-bold text-on-surface">
                {profile?.partner_contact ? profile.partner_contact.split('@')[0] : 'Belum Terhubung'}
              </h3>
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                profile?.partner_contact ? "bg-green-50 text-green-700" : "bg-surface-container-high text-outline"
              )}>
                {profile?.partner_contact ? '✓ Terhubung' : 'Tidak Terhubung'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2 rounded-full font-semibold text-outline hover:text-primary hover:bg-primary/5 transition-all border border-outline-variant/15"
          >
            {profile?.partner_contact ? 'Ubah' : 'Hubungkan'}
          </button>
        </div>

        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest p-6 rounded-lg shadow-md space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary px-2">Email Partner</label>
              <input 
                type="email" 
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                className="w-full h-14 bg-surface-container-high rounded-full border-none px-6 focus:ring-2 focus:ring-primary/20"
                placeholder="email@partner.com"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleUpdatePartner}
                className="flex-1 h-12 bg-primary text-white rounded-full font-bold shadow-lg pearl-texture"
              >
                Simpan
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 h-12 bg-surface-container-high text-secondary rounded-full font-bold"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}

        {/* Notification Toggles */}
        <div className="bg-surface-container-lowest rounded-lg p-6 shadow-sm">
          <h4 className="text-lg font-sans font-bold mb-6 text-primary-container">Atur Notifikasi Partner</h4>
          <div className="space-y-5">
            {[
              { label: 'Saat haid mulai', icon: Droplets, key: 'notify_period_start' },
              { label: 'Saat kram parah', icon: Heart, key: 'notify_cramps' },
              { label: 'Saat mood sangat buruk', icon: MessageSquare, key: 'notify_bad_mood' },
            ].map((item, i) => (
              <label key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <item.icon className="text-primary w-5 h-5" />
                  <span className="font-medium text-on-surface">{item.label}</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={profile?.[item.key] ?? true} 
                    onChange={() => toggleNotification(item.key)}
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-gradient-to-br from-secondary-container/50 to-surface-container rounded-lg p-6 overflow-hidden relative min-h-[300px] flex items-center justify-center">
          <div className="absolute top-4 left-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Tampilan di HP Partner</p>
          </div>
          <div className="w-[180px] h-[360px] bg-neutral-900 rounded-[2.5rem] border-[4px] border-neutral-800 shadow-2xl relative overflow-hidden transform rotate-2">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-neutral-800 rounded-full" />
            <div className="mt-12 px-3">
              <div className="bg-white/90 backdrop-blur rounded-2xl p-3 shadow-lg border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white fill-current" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800 uppercase">Serein Wings</span>
                </div>
                <p className="text-[11px] font-bold text-neutral-900">Si Cantik lagi PMS 🌸</p>
                <p className="text-[10px] text-neutral-600 leading-tight">"Aku lagi butuh pelukan hari ini 🥺"</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 w-20 h-20 opacity-90">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Mascot" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Privacy Banner */}
        <div className="flex items-center justify-center py-4 px-6 bg-tertiary-fixed/30 rounded-full border border-tertiary-fixed-dim/20">
          <div className="flex items-center gap-3">
            <Lock className="text-tertiary w-5 h-5" />
            <p className="text-sm font-medium text-tertiary">🔒 Kamu bisa pause kapan saja. Privasi kamu, kendalimu.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
