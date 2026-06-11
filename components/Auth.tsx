import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft, User, Calendar } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
  onShowPrivacyPolicy: () => void;
  initialIsSignUp?: boolean;
  onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onShowPrivacyPolicy, initialIsSignUp = false, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // Validation basique
        if (!acceptTerms) {
            throw new Error("Vous devez accepter les conditions d'utilisation.");
        }
        if (!firstName || !lastName || !birthDate) {
            throw new Error("Veuillez remplir tous les champs personnels.");
        }

        // 1. Création du compte Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
            // 2. Création du profil public
            const { error: profileError } = await supabase.from('profiles').insert([
                {
                    id: authData.user.id,
                    first_name: firstName,
                    last_name: lastName,
                    birth_date: birthDate
                }
            ]);

            if (profileError) {
                console.error("Erreur création profil:", profileError);
                // On ne bloque pas tout pour ça, mais c'est bon à savoir
            }
            
            setMessage({ text: "Inscription réussie ! Vous pouvez vous connecter.", type: 'success' });
            setIsSignUp(false);
        }

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess();
      }
    } catch (error: any) {
      // Safe error extraction to avoid [object Object]
      let errorMsg = error?.message || (typeof error === 'string' ? error : "Une erreur est survenue");
      
      // Handle specific Supabase rate limit error
      if (errorMsg.toLowerCase().includes('rate limit exceeded')) {
        errorMsg = "Trop de tentatives d'inscription. Supabase limite les envois d'emails à 3 par heure pour éviter le spam. Veuillez patienter environ 1 heure ou essayez une autre adresse email.";
      }
      
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 animate-fade-in my-8">
        {onBack && (
          <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <ArrowLeft size={16} /> Retour à l'accueil
          </button>
        )}
        <div className="flex flex-col items-center mb-6">
          <img src="/img/flash-study-logo.png" alt="FlashStudy" className="w-24 h-24 object-contain mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FlashStudy</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm">
            {isSignUp ? "Créez votre espace de révision intelligent" : "Bon retour parmi nous"}
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Champs Inscription uniquement */}
          {isSignUp && (
            <div className="space-y-4 animate-slide-in">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                required
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                placeholder="Jean"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            placeholder="Dupont"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date de naissance</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="date"
                            required
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>
          )}

          {/* Champs Communs */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-sm"
                placeholder="etudiant@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isSignUp && (
              <div className="flex items-start gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    required 
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 leading-tight cursor-pointer select-none">
                      En créant mon compte, j'accepte les <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Conditions Générales d'Utilisation</a> ainsi que la{' '}
                      <button type="button" onClick={(e) => { e.preventDefault(); onShowPrivacyPolicy(); }} className="text-indigo-600 dark:text-indigo-400 hover:underline">Politique de confidentialité (RGPD)</button>,
                      et je comprends que le contenu de mes cours est envoyé à l'IA (Google Gemini) pour générer mes quiz et fiches de révision.
                  </label>
              </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isSignUp ? "S'inscrire" : "Se connecter"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onShowPrivacyPolicy}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
          >
            Politique de confidentialité (RGPD)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;