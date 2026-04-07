import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, googleProvider, doc, setDoc, serverTimestamp } from '../lib/firebase';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
import Alert from '../components/Alert';

export default function AuthScreen() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: fullName });
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: fullName,
          email: email,
          is_verified: false,
          created_at: serverTimestamp()
        });
        
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile exists
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, {
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        is_verified: true,
        created_at: serverTimestamp()
      }, { merge: true });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <Alert message={error} onClose={() => setError(null)} />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif italic text-4xl text-primary">Serein Wings</h1>
          <h2 className="font-sans font-bold text-2xl text-on-surface">
            {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h2>
          <p className="text-on-surface-variant">
            {isLogin ? 'Masuk untuk memantau siklusmu' : 'Mulai perjalanan sehatmu bersama Serein'}
          </p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAuth} 
          className="bg-surface-container-lowest p-8 rounded-lg shadow-xl space-y-6"
        >
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary px-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-14 bg-surface-container-high rounded-full border-none pl-12 pr-6 focus:ring-2 focus:ring-primary/20"
                  placeholder="Nama kamu"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary px-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-surface-container-high rounded-full border-none pl-12 pr-6 focus:ring-2 focus:ring-primary/20"
                placeholder="email@contoh.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary px-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-surface-container-high rounded-full border-none pl-12 pr-6 focus:ring-2 focus:ring-primary/20"
                placeholder="Min. 8 karakter"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-full shadow-lg flex items-center justify-center space-x-2 pearl-texture disabled:opacity-50"
          >
            <span>{loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-surface-container-lowest px-2 text-on-surface-variant">Atau masuk dengan</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white text-on-surface font-bold rounded-full shadow-md flex items-center justify-center space-x-3 border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>Google</span>
          </button>
        </motion.form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-secondary font-medium hover:text-primary transition-colors"
          >
            {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </main>
  );
}
