import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, Lock, Shield } from 'lucide-react';
import { ChatMessage, Course } from '../types';
import { getChatResponse } from '../services/geminiService';

interface CourseChatProps {
  course: Course;
  onClose: () => void;
  isVip: boolean;
  onOpenPricing: () => void;
}

const CourseChat: React.FC<CourseChatProps> = ({ course, onClose, isVip, onOpenPricing }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Bonjour ! Je suis ton assistant pour le cours "${course.title}". Pose-moi une question, demande-moi d'expliquer un concept complexe ou de te donner des exemples !`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(course, messages, userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Désolé, j'ai eu un petit problème de connexion. Peux-tu reformuler ?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur flex justify-between items-center z-10 absolute top-0 w-full">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Assistant IA
                        {!isVip && <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Demo</span>}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{course.title}</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X size={20} />
            </button>
        </div>

        {/* Messages Area with PAYWALL BLUR */}
        <div className="flex-1 overflow-y-auto p-4 pt-20 pb-4 space-y-6 bg-slate-50 dark:bg-slate-950/50 relative">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} ${!isVip && msg.id !== 'welcome' ? 'blur-sm select-none opacity-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'}`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            
            {/* PAYWALL OVERLAY */}
            {!isVip && (
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 flex flex-col items-center justify-center p-8 text-center pt-32">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30 text-white animate-bounce">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Fonctionnalité Premium</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-sm">
                        L'assistant IA qui connaît votre cours par cœur est réservé aux membres VIP. Discutez, posez des questions et comprenez plus vite.
                    </p>
                    <button 
                        onClick={onOpenPricing}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Shield size={18} />
                        Débloquer maintenant
                    </button>
                </div>
            )}

            {isLoading && isVip && (
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles size={16} />
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                        <Loader2 className="animate-spin text-indigo-500" size={16} />
                        <span className="text-xs text-slate-400">En train de réfléchir...</span>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Disabled if not VIP) */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="relative">
                <input
                    type="text"
                    value={input}
                    disabled={!isVip}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={!isVip ? "Réservé aux membres Premium" : "Posez une question sur le cours..."}
                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all shadow-sm disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isLoading || !isVip}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isVip ? <Send size={18} /> : <Lock size={18} />}
                </button>
            </form>
        </div>
    </div>
  );
};

export default CourseChat;