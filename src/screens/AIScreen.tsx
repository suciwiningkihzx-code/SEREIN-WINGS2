import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { auth, db, doc, collection, addDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp } from '../lib/firebase';
import { Send, Bell, Sparkles, Lightbulb, User } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'ai_chats'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          role: data.role,
          text: data.text,
          timestamp: data.created_at?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Baru saja'
        } as Message;
      });

      if (chatData.length > 0) {
        setMessages(chatData);
      } else {
        setMessages([{ 
          role: 'model', 
          text: 'Halo Cantik! Serein di sini. Ada yang bisa aku bantu hari ini? Kamu bisa tanya tentang kesehatan, siklus, atau sekadar curhat. 😊',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const user = auth.currentUser;
    if (!user) return;

    const userMessageText = input;
    setInput('');
    setLoading(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, 'ai_chats'), {
        user_id: user.uid,
        role: 'user',
        text: userMessageText,
        created_at: serverTimestamp()
      });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.includes('placeholder')) {
        await addDoc(collection(db, 'ai_chats'), {
          user_id: user.uid,
          role: 'model',
          text: 'Aduh, Serein belum punya kunci untuk bicara nih. Coba cek pengaturannya ya? 🥺',
          created_at: serverTimestamp()
        });
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `Kamu adalah Serein AI, asisten kesehatan wanita yang ramah, suportif, dan cerdas. 
          Gunakan Bahasa Indonesia yang hangat dan akrab (panggil pengguna dengan "Cantik" atau "Sayang"). 
          Berikan saran kesehatan yang akurat namun tetap santai. Gunakan emoji yang lucu. 
          Jika pengguna bertanya tentang masalah medis serius, sarankan untuk berkonsultasi dengan dokter.`,
        },
      });

      const response = await chat.sendMessage({ message: userMessageText });
      
      // Save model response to Firestore
      await addDoc(collection(db, 'ai_chats'), {
        user_id: user.uid,
        role: 'model',
        text: response.text || 'Maaf, Serein sedang sedikit bingung. Bisa ulangi?',
        created_at: serverTimestamp()
      });

    } catch (error) {
      console.error('AI Error:', error);
      await addDoc(collection(db, 'ai_chats'), {
        user_id: user.uid,
        role: 'model',
        text: 'Aduh, koneksi Serein lagi terganggu nih. Coba lagi nanti ya? 🥺',
        created_at: serverTimestamp()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-surface">
      <header className="bg-surface/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 py-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-container flex items-center justify-center">
            <img 
              src="https://i.ibb.co.com/Kc57cFrp/sereinwings.jpg" 
              alt="Serein" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-serif italic text-xl text-primary">Serein</h1>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Asisten Kesehatan Kamu</p>
          </div>
        </div>
        <Bell className="text-primary w-6 h-6" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-24 pb-32 px-6 space-y-6">
        {/* Phase Info Banner */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-outline-variant/10">
          <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
            <Lightbulb className="text-tertiary w-6 h-6" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-on-surface">Kamu sedang di fase luteal 🌙</p>
            <p className="text-on-surface-variant">Yuk konsumsi magnesium untuk bantu kurangi kram!</p>
          </div>
        </div>

        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-white text-on-surface rounded-tl-none shadow-sm border border-outline-variant/5"
            )}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
            <span className="text-[10px] text-outline mt-1 px-2">{msg.timestamp}</span>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-primary animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">Serein sedang mengetik...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-24 left-0 right-0 px-6">
        <div className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya Serein..."
              className="w-full h-14 bg-white rounded-full border-none px-6 shadow-lg focus:ring-2 focus:ring-primary/20"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
