import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle, XCircle, Sparkles, Repeat, Layers, ArrowLeft } from 'lucide-react';
import { FlashcardItem } from '../types';

interface RevisionSheetProps {
  content: FlashcardItem[] | string;
  title: string;
  onClose: () => void; // Callback pour fermer proprement
}

const RevisionSheet: React.FC<RevisionSheetProps> = ({ content, title, onClose }) => {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<number>>(new Set());
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (typeof content === 'string') {
        // Fallback pour les anciennes données (texte brut)
        setCards([{
            id: 1,
            front: "Résumé (Format Texte)",
            back: content,
            tag: "Info"
        }]);
    } else {
        setCards(content);
    }
    // Reset state
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
  }, [content]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(c => c + 1);
        } else {
            finishSession();
        }
    }, 200);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(c => c - 1), 200);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markCard = (status: 'mastered' | 'review') => {
    const currentCard = cards[currentIndex];
    if (status === 'mastered') {
        setMasteredIds(prev => new Set(prev).add(currentCard.id));
        setReviewIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentCard.id);
            return newSet;
        });
    } else {
        setReviewIds(prev => new Set(prev).add(currentCard.id));
        setMasteredIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentCard.id);
            return newSet;
        });
    }
    handleNext();
  };

  const finishSession = () => {
    setShowSummary(true);
  };

  const restartReview = () => {
    if (reviewIds.size > 0 && reviewIds.size < cards.length) {
        const remainingCards = cards.filter(c => reviewIds.has(c.id));
        setCards(remainingCards);
    } else {
        if (typeof content !== 'string') setCards(content);
    }
    setMasteredIds(new Set());
    setReviewIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
  };

  if (showSummary) {
    return (
        <div className="max-w-2xl mx-auto animate-fade-in text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 mt-8">
            <div className="w-24 h-24 mx-auto bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={40} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Session Terminée !</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Vous avez passé en revue toutes les cartes.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{masteredIds.size}</div>
                    <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Maitrisées</div>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/50">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{reviewIds.size}</div>
                    <div className="text-xs font-medium text-orange-800 dark:text-orange-300 uppercase tracking-wide">À Revoir</div>
                </div>
            </div>

            <div className="flex gap-4 justify-center">
                <button 
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> Retour
                </button>
                <button 
                    onClick={restartReview}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-transform hover:scale-105"
                >
                    <Repeat size={20} />
                    {reviewIds.size > 0 ? "Réviser les ratées" : "Tout recommencer"}
                </button>
            </div>
        </div>
    );
  }

  const currentCard = cards[currentIndex];
  if (!currentCard) return <div className="p-8 text-center text-slate-500">Chargement des cartes...</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center min-h-[600px] animate-fade-in">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="text-indigo-500" size={20} />
                Flashcards
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        </div>
        <div className="text-sm font-medium px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
            {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
        <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        ></div>
      </div>

      {/* 3D CARD CONTAINER */}
      <div className="relative w-full max-w-lg aspect-[4/3] perspective-1000 group cursor-pointer" onClick={handleFlip}>
        <div className={`
            relative w-full h-full duration-500 preserve-3d transition-transform
            ${isFlipped ? 'rotate-y-180' : ''}
        `}>
            {/* FRONT FACE */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                <span className="mb-4 inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-full">
                    {currentCard.tag}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {currentCard.front}
                </h3>
                <div className="absolute bottom-6 text-xs font-medium text-slate-400 flex items-center gap-1 animate-pulse">
                    <RotateCw size={14} />
                    Cliquer pour retourner
                </div>
            </div>

            {/* BACK FACE */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="prose prose-invert prose-lg leading-relaxed max-h-full overflow-y-auto custom-scrollbar">
                    {currentCard.back}
                </div>
            </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-6 mt-10 w-full max-w-lg justify-between px-4">
         <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
         >
            <ChevronLeft size={24} />
         </button>

         {/* Rating Buttons */}
         <div className={`flex gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
            <button 
                onClick={(e) => { e.stopPropagation(); markCard('review'); }}
                className="flex flex-col items-center gap-1 group"
            >
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center border-2 border-transparent group-hover:border-orange-400 transition-all shadow-sm">
                    <XCircle size={28} />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-orange-500">À revoir</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); markCard('mastered'); }}
                className="flex flex-col items-center gap-1 group"
            >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-transparent group-hover:border-emerald-400 transition-all shadow-sm">
                    <CheckCircle size={28} />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-emerald-500">Compris</span>
            </button>
         </div>

         <button 
            onClick={handleNext}
            className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
         >
            <ChevronRight size={24} />
         </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default RevisionSheet;