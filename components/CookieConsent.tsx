import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'flashstudy-cookie-consent';

interface CookieConsentProps {
  onShowPrivacyPolicy: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onShowPrivacyPolicy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[150] p-4 flex justify-center animate-slide-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 shrink-0"><Cookie size={22} /></div>
        <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
          Nous utilisons uniquement les données nécessaires au fonctionnement de FlashStudy. Le contenu de vos cours (texte ou fichiers téléversés)
          est envoyé à l'IA <strong>Google Gemini</strong> uniquement pour générer vos quiz, flashcards et fiches de révision.
          Aucune donnée n'est utilisée à des fins publicitaires.{' '}
          <button onClick={onShowPrivacyPolicy} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">En savoir plus</button>
        </p>
        <button onClick={accept} className="w-full sm:w-auto shrink-0 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-colors">
          J'ai compris
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
