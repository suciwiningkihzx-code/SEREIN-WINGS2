import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, doc, setDoc, onSnapshot, serverTimestamp } from '../lib/firebase';
import { Bell, CheckCircle, Sparkles, Package, Gift } from 'lucide-react';
import { cn } from '../lib/utils';
import Alert from '../components/Alert';

const plans = [
  {
    id: 'self_care',
    name: 'Self Care',
    price: 'Rp 45.000',
    description: 'Paket lengkap untuk kenyamanan maksimal.',
    features: [
      'Softex & Kiranti',
      'Pain Relief Heat Patch',
      'Iron Supplements',
      'Pocky Chocolate Snack',
      'Premium App Features'
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYgiJmb4oOqdMOv5fv25dkmO9Ivcy1lybIChkr2ehztOXiot7Hmn5frEzRr3etaGlG5yA8pbSbIq3IHeat71aFYeSuc2IJW8JUL8JvGqH_727W_Jp9VPauKOkATNKoPq4lYNLMjE-OLmdUBaJ230NrOaHk7K-ZKJHeSUYbuqvGHOeOrGDHZNtSHCcawSeJXKNeYEsJdWmhvPLn11Ocpv2t1m25PUjPFV-DvaKmvtfKpvP3-m5evbhHAlXxYEdrhukbxuI8PXmnaeo',
    featured: true
  },
  {
    id: 'basic',
    name: 'Basic Huge',
    price: 'Rp 29.500',
    description: 'Kebutuhan dasar untuk siklusmu.',
    features: [
      'Softex & Kiranti',
      'Pain Relief Heat Patch',
      'Standard App Features'
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXCcv3HHed1YYTdEGTQZfNdZs1SvmHfhZMZKTTuJC-6s4wZ6yzX4Y91AF9Er5Zr4v9QajIDUbubr3otieM1tKGVwZE7F5bGIMA_hDnItatAAFGti9ciLWxeBTA0YTwNf_2uXVUvWxoPW29OUNMY4Eo0VNS5wwLLTPcwgEta27j7516Tg9Jaul00sAV9Gs94vVBCmS3swX81lzMmlpGyL9BNbxU0BGOqIhgjW4cxgHOjhemCvRcp3yw9L1Yzc8XGbtsT00HCJ6l_CmtQ',
    featured: false
  }
];

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'subscriptions', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.status === 'active') {
          setCurrentPlan(data.plan_type);
        }
      }
    }, (err) => {
      console.error('Subscription fetch error:', err);
      setError(err.message);
    });

    return () => unsub();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not found');

      await setDoc(doc(db, 'subscriptions', user.uid), {
        user_id: user.uid,
        plan_type: planId,
        status: 'active',
        updated_at: serverTimestamp()
      }, { merge: true });

      setCurrentPlan(planId);
      navigate('/tracking');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
      <Alert message={error} onClose={() => setError(null)} />
      <header className="bg-surface/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Mascot" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-sans font-semibold text-lg text-primary">Selamat Pagi, Cantik</h1>
        </div>
        <button className="text-primary p-2 hover:bg-rose-50/50 transition-colors rounded-full">
          <Bell className="w-6 h-6" />
        </button>
      </header>

      <section className="mb-8 text-center">
        <h2 className="font-sans font-extrabold text-3xl text-primary tracking-tight mb-2">Pilih Paket Kamu 🎁</h2>
        <p className="text-on-surface-variant font-medium">Dikirim otomatis 5 hari sebelum haidmu</p>
      </section>

      <section className="mb-8 relative overflow-hidden rounded-lg bg-secondary-container/40 p-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-on-secondary-container font-semibold leading-snug">
            Paket dikirim otomatis, kamu nggak perlu order manual!
          </p>
        </div>
        <div className="w-20 shrink-0">
          <img 
            src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
            alt="Serein" 
            className="w-full h-auto drop-shadow-md"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      <div className="space-y-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={cn(
              "relative rounded-lg p-[2px] shadow-lg transition-all",
              plan.featured ? "bg-gradient-to-br from-tertiary-fixed via-primary-fixed to-secondary-fixed" : "bg-outline-variant/10"
            )}
          >
            <div className="bg-surface-container-lowest rounded-[1.85rem] p-6 relative overflow-hidden">
              {plan.featured && (
                <div className="absolute top-4 right-6 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  TERLARIS ⭐
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-sans font-bold text-2xl text-primary mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-primary font-extrabold text-2xl">{plan.price}</span>
                    <span className="text-on-surface-variant text-sm">/ bulan</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex justify-center py-4 bg-surface-container-low rounded-lg">
                <img 
                  src={plan.image} 
                  alt={plan.name} 
                  className="h-32 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-on-secondary-container">
                    <CheckCircle className="text-primary w-5 h-5 fill-current" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading || currentPlan === plan.id}
                className={cn(
                  "w-full font-sans font-bold py-4 rounded-full transition-all",
                  currentPlan === plan.id 
                    ? "bg-green-500 text-white cursor-default"
                    : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 pearl-texture"
                )}
              >
                {currentPlan === plan.id ? 'Paket Aktif' : `Pilih ${plan.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center px-4">
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Pembayaran akan diperpanjang secara otomatis setiap bulan. Kamu bisa membatalkan langganan kapan saja melalui pengaturan akun.
        </p>
      </div>
    </main>
  );
}
