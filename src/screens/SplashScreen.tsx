import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Droplets, Heart, Sparkles } from 'lucide-react';

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#ffd9df] via-[#fcf8fa] to-[#f8d8ff]">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-[15%] left-[10%]"
        >
          <Droplets className="text-primary w-12 h-12" />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-[25%] right-[15%]"
        >
          <Heart className="text-tertiary w-8 h-8 fill-current" />
        </motion.div>
        <motion.div 
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] left-[80%]"
        >
          <Sparkles className="text-secondary w-10 h-10" />
        </motion.div>
      </div>

      {/* Logo & Brand */}
      <div className="relative z-10 flex flex-col items-center pt-24 space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
            <Droplets className="text-primary w-20 h-20 fill-current" />
            <div className="absolute -top-2 text-tertiary">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h1 className="font-sans font-extrabold text-4xl tracking-tighter text-primary">
            Serein <span className="font-serif italic font-normal text-tertiary">Wings</span>
          </h1>
        </motion.div>
        <p className="font-serif italic text-xl text-secondary opacity-80">
          Cerah setelah hujan
        </p>
      </div>

      {/* Mascot */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <img 
            src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
            alt="Serein Mascot" 
            className="w-64 h-64 object-contain drop-shadow-2xl relative z-10"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      {/* Actions */}
      <div className="relative z-10 w-full max-w-md px-8 pb-16 space-y-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/auth')}
          className="w-full h-16 bg-primary text-white font-sans font-semibold text-lg rounded-full shadow-lg flex items-center justify-center space-x-2 pearl-texture"
        >
          <span>Mulai Sekarang</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        <button 
          onClick={() => navigate('/auth')}
          className="w-full h-14 bg-transparent text-secondary font-sans font-medium text-base rounded-full hover:bg-secondary-container/30 transition-all"
        >
          Sudah punya akun? <span className="font-bold text-primary">Login</span>
        </button>
      </div>
    </main>
  );
}
