import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, collection, query, where, orderBy, onSnapshot } from '../lib/firebase';
import { ChevronLeft, Calendar, Droplets, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import Alert from '../components/Alert';

export default function HistoryScreen() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'period_logs'),
      where('user_id', '==', user.uid),
      orderBy('start_date', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
      setLoading(false);
    }, (err) => {
      console.error('History fetch error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return 'Sedang berlangsung';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} Hari`;
  };

  if (loading) return null;

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
      <Alert message={error} onClose={() => setError(null)} />
      
      <header className="bg-surface/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 flex items-center w-full px-6 py-4">
        <button onClick={() => navigate(-1)} className="p-2 text-primary hover:bg-rose-50/50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-sans font-bold text-lg text-primary ml-2">Riwayat Haid</h1>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-sans font-bold text-primary">Siklus Terakhir</h2>
          <span className="text-xs font-bold text-outline uppercase tracking-widest">{logs.length} Log</span>
        </div>

        {logs.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-lg text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Droplets className="w-8 h-8 text-primary" />
            </div>
            <p className="text-on-surface-variant font-medium">Belum ada riwayat haid yang tercatat.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-md"
            >
              Catat Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, i) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-container-lowest p-6 rounded-lg shadow-sm flex items-center justify-between border-l-4 border-primary"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">
                      {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(log.start_date))}
                    </h3>
                    <p className="text-xs font-medium text-on-surface-variant">
                      {log.end_date ? `Sampai ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long' }).format(new Date(log.end_date))}` : 'Masih berlangsung'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {calculateDuration(log.start_date, log.end_date)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-secondary-container/30 p-6 rounded-lg flex items-center gap-4 relative overflow-hidden">
        <div className="flex-1 relative z-10">
          <h4 className="font-sans font-bold text-primary mb-1">Butuh Bantuan?</h4>
          <p className="text-xs text-on-secondary-container font-medium leading-relaxed">
            Serein AI bisa bantu kamu menganalisis siklus haidmu yang tidak teratur.
          </p>
          <button 
            onClick={() => navigate('/ai')}
            className="mt-3 flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            Tanya Serein <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="w-20 h-20 relative z-10">
          <img 
            src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
            alt="Serein" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary opacity-5 rounded-full blur-xl" />
      </section>
    </main>
  );
}
