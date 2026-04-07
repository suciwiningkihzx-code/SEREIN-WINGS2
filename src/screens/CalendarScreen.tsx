import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, Bell, Droplets, Sparkles, Edit3, Plus } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn, getCyclePhase } from '../lib/utils';

export default function CalendarScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getDayStatus = (date: Date) => {
    if (!profile) return null;
    
    const lastPeriod = new Date(profile.last_period_date);
    const cycleLength = profile.cycle_length;
    const periodDuration = profile.period_duration;
    
    // Calculate if date is in a period
    // This is a simplified calculation for multiple cycles
    const diffDays = Math.floor((date.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength || cycleLength;
    
    if (dayInCycle <= periodDuration) return 'menstruasi';
    if (dayInCycle >= cycleLength - 16 && dayInCycle <= cycleLength - 12) return 'subur';
    if (dayInCycle === cycleLength - 14) return 'ovulasi';
    return null;
  };

  if (loading) return null;

  return (
    <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
      <header className="bg-surface/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-40 flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Mascot" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-sans font-semibold text-lg text-primary">Kalender</h1>
        </div>
        <button className="text-primary p-2 hover:bg-rose-50/50 transition-colors rounded-full">
          <Bell className="w-6 h-6" />
        </button>
      </header>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-[10px] font-medium text-on-surface-variant">Menstruasi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-tertiary" />
          <span className="text-[10px] font-medium text-on-surface-variant">Ovulasi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary-container" />
          <span className="text-[10px] font-medium text-on-surface-variant">Subur</span>
        </div>
      </div>

      {/* Calendar */}
      <section className="bg-surface-container-lowest rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setCurrentMonth(addDays(startOfMonth(currentMonth), -1))} className="p-2 text-primary hover:bg-surface-container-low rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="font-sans font-bold text-lg text-primary capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </h2>
          <button onClick={() => setCurrentMonth(addDays(endOfMonth(currentMonth), 1))} className="p-2 text-primary hover:bg-surface-container-low rounded-full">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-4 text-center">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
            <div key={day} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pb-4">{day}</div>
          ))}
          
          {/* Empty cells for padding */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {days.map((date) => {
            const status = getDayStatus(date);
            const isToday = isSameDay(date, new Date());
            
            return (
              <div key={date.toString()} className="h-10 flex flex-col items-center justify-center relative">
                <div className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all",
                  status === 'menstruasi' && "bg-primary text-white font-bold",
                  status === 'ovulasi' && "bg-tertiary text-white font-bold",
                  status === 'subur' && "bg-secondary-container text-primary font-bold",
                  isToday && !status && "border-2 border-primary text-primary font-bold"
                )}>
                  {format(date, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
        <div className="flex-shrink-0 bg-surface-container-low p-4 rounded-lg flex flex-col min-w-[120px]">
          <span className="text-[10px] text-on-surface-variant font-medium">Rata-rata siklus</span>
          <span className="text-primary font-bold text-lg">{profile?.cycle_length || 28} hari</span>
        </div>
        <div className="flex-shrink-0 bg-surface-container-low p-4 rounded-lg flex flex-col min-w-[120px]">
          <span className="text-[10px] text-on-surface-variant font-medium">Durasi haid</span>
          <span className="text-primary font-bold text-lg">{profile?.period_duration || 5} hari</span>
        </div>
      </section>

      {/* Tip */}
      <div className="relative mt-12 mb-8 bg-tertiary/10 rounded-lg p-6 flex items-start gap-4">
        <img 
          src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
          alt="Mascot" 
          className="w-16 h-16 absolute -top-8 -right-4 drop-shadow-lg"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 pr-8">
          <h3 className="font-sans font-bold text-tertiary mb-1">Hai Cantik!</h3>
          <p className="text-sm text-secondary leading-relaxed">Siklus kamu bulan ini terlihat sangat stabil. Jangan lupa istirahat cukup, ya!</p>
        </div>
      </div>

      <button className="fixed bottom-24 right-6 bg-primary text-white flex items-center gap-2 px-6 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all z-50">
        <Plus className="w-5 h-5" />
        <span className="font-semibold text-sm">Catat Haid Mulai</span>
      </button>
    </main>
  );
}
