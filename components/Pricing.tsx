import React, { useState } from 'react';
import { Check, Star, Zap, Shield, X, Loader2, Crown } from 'lucide-react';
import { createCheckoutSession } from '../services/stripeService';

interface PricingProps {
  isOpen?: boolean;
  onClose?: () => void;
  showNotification?: (msg: string, type: 'error' | 'success') => void;
}

const Pricing: React.FC<PricingProps> = ({ isOpen, onClose, showNotification }) => {
  const [loading, setLoading] = useState(false);

  // Si on l'utilise comme modal (isOpen est passé), on garde le comportement modal
  // Sinon, on le traite comme une page (toujours visible)
  const isModal = isOpen !== undefined;

  if (isModal && !isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      console.error("Erreur paiement:", error);
      if (showNotification) {
        showNotification("Erreur lors de la création du paiement. Veuillez réessayer.", "error");
      } else {
        alert("Erreur lors de la création du paiement. Veuillez réessayer.");
      }
      setLoading(false);
    }
  };

  const content = (
    <div className={`${isModal ? 'bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none animate-slide-in relative' : 'w-full max-w-6xl mx-auto flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in'}`}>
      
      {isModal && (
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 z-10 transition-colors">
            <X size={20} />
        </button>
      )}

      {/* Left Side: Benefits & Free Plan */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
            Plan Actuel
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Étudiant Standard</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">L'essentiel pour commencer vos révisions avec l'IA.</p>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500"><Check size={14} /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">2 Cours Importés</p>
                <p className="text-sm text-slate-500">Limite de stockage pour vos documents.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500"><Check size={14} /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">3 Générations IA</p>
                <p className="text-sm text-slate-500">Quiz et flashcards limités par mois.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 opacity-50">
              <div className="mt-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400"><X size={14} /></div>
              <div>
                <p className="font-semibold text-slate-400">Assistant IA (Chat)</p>
                <p className="text-sm text-slate-400">Posez des questions à vos cours.</p>
              </div>
            </div>
          </div>
        </div>
        
        {!isModal && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">Vous utilisez actuellement la version gratuite. Passez à l'étape supérieure pour booster vos résultats.</p>
          </div>
        )}
      </div>

      {/* Right Side: Premium Plan */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-white dark:bg-slate-900 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
              Recommandé
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">9.99€</span>
              <span className="text-slate-500 text-sm">/mois</span>
            </div>
          </div>

          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Étudiant Premium</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-10">La solution complète pour exceller dans vos études sans limites.</p>
          
          <ul className="space-y-5 mb-12">
            <li className="flex items-center gap-4 group">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform"><Zap size={18} /></div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Cours & Générations Illimités</p>
                <p className="text-xs text-slate-500">Plus aucune barrière à votre apprentissage.</p>
              </div>
            </li>
            <li className="flex items-center gap-4 group">
              <div className="p-2 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform"><Star size={18} /></div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Assistant IA Illimité</p>
                <p className="text-xs text-slate-500">Discutez avec vos cours et obtenez des réponses claires.</p>
              </div>
            </li>
            <li className="flex items-center gap-4 group">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform"><Shield size={18} /></div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Zéro Publicité & Support Prioritaire</p>
                <p className="text-xs text-slate-500">Une expérience fluide et une aide rapide.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg shadow-2xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Crown size={24} fill="currentColor" />}
            {loading ? "Traitement sécurisé..." : "Devenir Premium"}
          </button>
          
          <div className="flex items-center justify-center gap-6 opacity-50">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
              <Shield size={12} /> SSL Secure
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
              <Check size={12} /> Annulable à tout moment
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
        {content}
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Passez à la vitesse supérieure 🚀</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Rejoignez des milliers d'étudiants qui utilisent l'IA pour réviser plus intelligemment, pas plus durement.</p>
      </div>
      {content}
    </div>
  );
};

export default Pricing;