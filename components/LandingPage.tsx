import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  MessageCircle,
  LayoutDashboard,
  FileText,
  Crown,
  Check,
  ArrowRight,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
  ShieldCheck,
  UploadCloud,
  Wand2,
  GraduationCap,
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  onShowPrivacyPolicy: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onShowPrivacyPolicy, isDarkMode, onToggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <UploadCloud size={24} />,
      color: 'from-indigo-500 to-blue-500',
      title: 'Importez vos cours',
      description: "Glissez vos PDF ou collez votre texte. FlashStudy s'occupe d'organiser vos documents par dossiers et matières.",
    },
    {
      icon: <Layers size={24} />,
      color: 'from-blue-500 to-cyan-500',
      title: 'Flashcards générées par l\'IA',
      description: "Transformez n'importe quel cours en fiches de révision claires et synthétiques, prêtes à être mémorisées.",
    },
    {
      icon: <Sparkles size={24} />,
      color: 'from-purple-500 to-pink-500',
      title: 'Quiz interactifs',
      description: "Testez vos connaissances avec des quiz générés automatiquement, corrigés et expliqués par l'IA.",
    },
    {
      icon: <MessageCircle size={24} />,
      color: 'from-emerald-500 to-teal-500',
      title: 'Assistant IA personnel',
      description: "Posez vos questions directement à vos cours et obtenez des réponses claires, sourcées sur votre contenu.",
    },
    {
      icon: <LayoutDashboard size={24} />,
      color: 'from-amber-500 to-orange-500',
      title: 'Suivi de progression',
      description: "Un tableau de bord clair pour visualiser vos cours, vos générations et votre activité de révision.",
    },
    {
      icon: <ShieldCheck size={24} />,
      color: 'from-slate-500 to-slate-700',
      title: 'Confidentialité respectée',
      description: "Vos données sont stockées de façon sécurisée et ne sont jamais utilisées à des fins publicitaires.",
    },
  ];

  const steps = [
    {
      icon: <UploadCloud size={28} />,
      title: '1. Importez',
      description: "Ajoutez un cours sous forme de fichier PDF ou de texte en quelques secondes.",
    },
    {
      icon: <Wand2 size={28} />,
      title: '2. Générez',
      description: "L'IA analyse votre contenu et crée flashcards, quiz et fiches de révision sur mesure.",
    },
    {
      icon: <GraduationCap size={28} />,
      title: '3. Révisez',
      description: "Mémorisez efficacement, testez vos connaissances et suivez vos progrès au fil du temps.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/img/flash-study-logo.png" alt="FlashStudy" className="w-9 h-9 object-contain" />
            <span className="text-xl font-bold tracking-tight">FlashStudy</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Fonctionnalités</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Comment ça marche</button>
            <button onClick={() => scrollTo('pricing')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Tarifs</button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={onToggleDarkMode} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={onLogin} className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 transition-colors">
              Se connecter
            </button>
            <button onClick={onSignup} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.03]">
              Essai gratuit
            </button>
          </div>

          {/* Mobile burger */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={onToggleDarkMode} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-1 animate-slide-in">
            <button onClick={() => scrollTo('features')} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Fonctionnalités</button>
            <button onClick={() => scrollTo('how-it-works')} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Comment ça marche</button>
            <button onClick={() => scrollTo('pricing')} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Tarifs</button>
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button onClick={onLogin} className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">Se connecter</button>
              <button onClick={onSignup} className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20">Essai gratuit</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-24 md:pt-24 md:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Propulsé par l'IA Gemini
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
              Révisez plus <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">intelligemment</span>, pas plus durement
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0">
              FlashStudy transforme automatiquement vos cours en flashcards, quiz interactifs et fiches de révision grâce à l'intelligence artificielle. Importez, générez, révisez.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button onClick={onSignup} className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Commencer gratuitement <ArrowRight size={20} />
              </button>
              <button onClick={() => scrollTo('how-it-works')} className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Voir comment ça marche
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">
              Aucune carte bancaire requise · 2 cours et 3 générations IA offerts
            </p>
          </div>

          {/* Visual mockup */}
          <div className="relative animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tableau de bord</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold">Bonjour, Léa 👋</h3>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold"><Crown size={10} fill="white" /> VIP</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">Prêt à réviser ? Voici votre activité.</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
                  <BookOpen className="text-indigo-600 dark:text-indigo-400 mb-2" size={22} />
                  <div className="text-2xl font-black">12</div>
                  <div className="text-xs text-slate-500">Cours importés</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4">
                  <Sparkles className="text-emerald-600 dark:text-emerald-400 mb-2" size={22} />
                  <div className="text-2xl font-black">34</div>
                  <div className="text-xs text-slate-500">Flashcards & Quiz</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg"><Layers size={18} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Flashcards: Histoire - Chap. 4</p>
                    <p className="text-xs text-slate-400">Générées il y a 2 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Sparkles size={18} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Quiz: Biologie cellulaire</p>
                    <p className="text-xs text-slate-400">Score : 9/10</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="hidden md:flex absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 items-center gap-3 animate-fade-in">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl"><MessageCircle size={20} /></div>
              <div>
                <p className="text-sm font-bold">Assistant IA</p>
                <p className="text-xs text-slate-400">Posez vos questions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Tout ce qu'il vous faut pour réviser efficacement</h2>
            <p className="text-slate-500 dark:text-slate-400">Une suite d'outils pensée pour les étudiants, alimentée par l'intelligence artificielle.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Comment ça marche</h2>
            <p className="text-slate-500 dark:text-slate-400">Trois étapes simples entre votre cours et votre prochaine bonne note.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={step.title} className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                  {step.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight size={24} className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-300 dark:text-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Des tarifs simples, sans surprise</h2>
            <p className="text-slate-500 dark:text-slate-400">Commencez gratuitement, passez Premium quand vous êtes prêt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free plan */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest mb-6 w-fit">
                Gratuit
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black">0€</span>
                <span className="text-slate-400 text-sm">/mois</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Pour découvrir FlashStudy.</p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm"><div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500"><Check size={14} /></div> 2 cours importés</li>
                <li className="flex items-center gap-3 text-sm"><div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500"><Check size={14} /></div> 3 générations IA / mois</li>
                <li className="flex items-center gap-3 text-sm"><div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500"><Check size={14} /></div> Quiz & flashcards illimités à consulter</li>
              </ul>
              <button onClick={onSignup} className="w-full py-3.5 rounded-2xl border border-slate-300 dark:border-slate-600 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Commencer gratuitement
              </button>
            </div>

            {/* Premium plan */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-500 p-8 flex flex-col shadow-2xl shadow-indigo-500/10">
              <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
                  Recommandé
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black">9.99€</span>
                <span className="text-slate-400 text-sm">/mois</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Pour réviser sans aucune limite.</p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm"><div className="p-1 bg-indigo-600 text-white rounded-full"><Zap size={12} /></div> Cours & générations illimités</li>
                <li className="flex items-center gap-3 text-sm"><div className="p-1 bg-indigo-600 text-white rounded-full"><Zap size={12} /></div> Assistant IA illimité</li>
                <li className="flex items-center gap-3 text-sm"><div className="p-1 bg-indigo-600 text-white rounded-full"><Zap size={12} /></div> Zéro publicité & support prioritaire</li>
                <li className="flex items-center gap-3 text-sm"><div className="p-1 bg-indigo-600 text-white rounded-full"><Zap size={12} /></div> Annulable à tout moment</li>
              </ul>
              <button onClick={onSignup} className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Crown size={18} fill="currentColor" /> Devenir Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl">
            <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <h2 className="relative text-3xl md:text-4xl font-black mb-4">Prêt à transformer vos cours en succès ?</h2>
            <p className="relative text-white/90 mb-8 max-w-xl mx-auto">Rejoignez FlashStudy gratuitement et laissez l'IA vous aider à réviser plus vite, et mieux.</p>
            <button onClick={onSignup} className="relative bg-white text-indigo-600 font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all inline-flex items-center gap-2">
              Créer mon compte gratuit <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/img/flash-study-logo.png" alt="FlashStudy" className="w-8 h-8 object-contain" />
            <span className="font-bold tracking-tight">FlashStudy</span>
          </div>
          <p className="text-sm text-slate-400 text-center">© {new Date().getFullYear()} FlashStudy. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <button onClick={onShowPrivacyPolicy} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors">
              Confidentialité (RGPD)
            </button>
            <button onClick={onLogin} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors">
              Se connecter
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
