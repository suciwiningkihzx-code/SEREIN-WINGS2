import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, doc, onSnapshot } from '../lib/firebase';
import { ArrowLeft, Bell, CheckCircle, Copy, Package, Truck, MapPin, Layers, Leaf } from 'lucide-react';
import { cn } from '../lib/utils';
import Alert from '../components/Alert';

export default function TrackingScreen() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'subscriptions', user.uid), (doc) => {
      if (doc.exists()) {
        setSubscription(doc.data());
      }
      setLoading(false);
    }, (err) => {
      console.error('Subscription fetch error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-surface pb-32">
      <Alert message={error} onClose={() => setError(null)} />
      <header className="bg-surface/70 backdrop-blur-xl flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50/50 transition-colors">
            <ArrowLeft className="text-primary w-6 h-6" />
          </button>
          <h1 className="font-sans font-semibold text-lg text-primary">Lacak Pengiriman</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center">
          <img 
            src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
            alt="Mascot" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 space-y-8 mt-4">
        {/* Hero Section */}
        <section className="relative bg-surface-container-low rounded-lg p-8 overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-100/50 to-transparent" />
          <div className="relative z-10">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Package" 
              className="w-48 h-48 mx-auto"
              referrerPolicy="no-referrer"
            />
            <h2 className="font-sans font-bold text-2xl text-primary mt-4 tracking-tight">Paketmu Dalam Perjalanan 🚚</h2>
            <p className="font-body text-on-secondary-container mt-2">Serein sedang terbang membawa kebahagiaanmu!</p>
          </div>
        </section>

        {/* Shipment Info */}
        <section className="bg-surface-container-lowest rounded-lg p-6 shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-outline uppercase tracking-widest">Kurir Pengiriman</p>
              <p className="font-sans font-bold text-lg text-on-surface">Serein Express</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-outline uppercase tracking-widest">Estimasi Tiba</p>
              <p className="font-sans font-bold text-lg text-primary">Besok (Hari H)</p>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-full px-4 py-3 flex justify-between items-center group">
            <div className="flex items-center gap-2">
              <Package className="text-primary w-5 h-5" />
              <span className="font-body font-medium text-sm text-on-surface">RESI-WINGS-202409</span>
            </div>
            <Copy className="text-outline w-4 h-4 group-hover:text-primary transition-colors cursor-pointer" />
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-6">
          <h3 className="font-sans font-bold text-xl text-on-surface flex items-center gap-2">
            <MapPin className="text-primary w-5 h-5" />
            Status Perjalanan
          </h3>
          <div className="relative pl-8 space-y-12">
            <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-outline-variant/30" />
            
            {[
              { title: 'Pesanan dibuat otomatis', desc: 'Sistem Serein Wings telah menjadwalkan pengiriman rutinmu.', time: 'H-7', done: true },
              { title: 'Paket diproses di warehouse', desc: 'Serein sedang membungkus paketmu dengan penuh cinta.', time: 'H-5', done: true },
              { title: 'Paket dalam perjalanan 🚚', desc: 'Paketmu sudah keluar dari pusat sortir utama.', time: 'H-3', done: true },
              { title: 'Konfirmasi penerimaan', desc: 'Paket sudah mendekati lokasimu! Siap-siap ya, Cantik.', time: 'H-1', current: true },
              { title: 'Paket diterima', desc: 'Nikmati hari yang tenang bersama Serein Wings.', time: 'Hari H', future: true },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className={cn(
                  "absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-md",
                  step.done ? "bg-primary text-white" : step.current ? "bg-primary ring-4 ring-primary/20" : "bg-surface-variant border-2 border-outline-variant"
                )}>
                  {step.done && <CheckCircle className="w-4 h-4 fill-current" />}
                  {step.current && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                </div>
                <div className={cn(step.future && "opacity-40")}>
                  <div className="flex items-baseline justify-between">
                    <h4 className={cn("font-sans font-bold", step.current ? "text-primary" : "text-on-surface")}>{step.title}</h4>
                    <span className="text-[10px] text-outline">{step.time}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="space-y-4">
          <h3 className="font-sans font-bold text-xl text-on-surface">Isi Paket</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-4 rounded-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Layers className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="font-sans font-bold text-sm">Pads Set</p>
                <p className="text-[10px] text-outline">Day & Night</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Leaf className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="font-sans font-bold text-sm">Essential Oil</p>
                <p className="text-[10px] text-outline">Calm Lavender</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surface via-surface to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button className="w-full bg-primary text-white py-5 rounded-full font-sans font-bold text-lg shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 pearl-texture">
            Konfirmasi Diterima
            <CheckCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </main>
  );
}
