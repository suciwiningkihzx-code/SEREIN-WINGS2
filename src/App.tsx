import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, db, onAuthStateChanged, doc, onSnapshot, handleFirestoreError, OperationType } from './lib/firebase';
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import CalendarScreen from './screens/CalendarScreen';
import AIScreen from './screens/AIScreen';
import MoodScreen from './screens/MoodScreen';
import PartnerScreen from './screens/PartnerScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import TrackingScreen from './screens/TrackingScreen';
import ProfileScreen from './screens/ProfileScreen';
import HistoryScreen from './screens/HistoryScreen';
import Layout from './components/Layout';

function ProtectedRoute({ children, user, isOnboarded }: { children: React.ReactNode, user: any, isOnboarded: boolean | null }) {
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (isOnboarded === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (isOnboarded === true && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    let unsubOnboarding: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        console.log("User logged in, UID:", currentUser.uid);
        // Source of truth for onboarding is the existence of a cycle profile
        const docRef = doc(db, 'cycle_profiles', currentUser.uid);
        unsubOnboarding = onSnapshot(docRef, (docSnap) => {
          setIsOnboarded(docSnap.exists());
          setLoading(false);
        }, (error) => {
          const errInfo = handleFirestoreError(error, OperationType.GET, `cycle_profiles/${currentUser.uid}`);
          console.error("Error listening to onboarding status:", errInfo);
          setIsOnboarded(false);
          setLoading(false);
        });
      } else {
        setIsOnboarded(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubOnboarding) unsubOnboarding();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="font-serif italic text-primary text-xl">Serein Wings</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthScreen />} />
        
        <Route element={<Layout user={user} />}>
          <Route path="/onboarding" element={
            <ProtectedRoute user={user} isOnboarded={isOnboarded}>
              <OnboardingScreen />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><DashboardScreen /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><CalendarScreen /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><AIScreen /></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><MoodScreen /></ProtectedRoute>} />
          <Route path="/partner" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><PartnerScreen /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><SubscriptionScreen /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><TrackingScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><ProfileScreen /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute user={user} isOnboarded={isOnboarded}><HistoryScreen /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}
