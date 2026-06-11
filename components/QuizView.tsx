import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
  onClose: () => void; // Callback pour fermer proprement
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (onComplete) onComplete(score + (selectedOption === questions[currentIndex].correctAnswer ? 0 : 0)); 
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "Continuez vos efforts !";
    let colorClass = "text-indigo-600 dark:text-indigo-400";
    let bgClass = "bg-indigo-50 dark:bg-indigo-900/30";

    if (percentage >= 80) {
      message = "Excellent travail !";
      colorClass = "text-emerald-600 dark:text-emerald-400";
      bgClass = "bg-emerald-50 dark:bg-emerald-900/30";
    } else if (percentage >= 50) {
      message = "Pas mal du tout !";
      colorClass = "text-blue-600 dark:text-blue-400";
      bgClass = "bg-blue-50 dark:bg-blue-900/30";
    } else {
      colorClass = "text-orange-600 dark:text-orange-400";
      bgClass = "bg-orange-50 dark:bg-orange-900/30";
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center transition-colors animate-fade-in max-w-2xl mx-auto mt-8">
        <div className={`w-32 h-32 rounded-full ${bgClass} flex items-center justify-center mb-6 relative`}>
            <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={colorClass}
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
            <span className={`text-3xl font-bold ${colorClass}`}>{percentage}%</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Quiz Terminé !</h2>
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">{message}</p>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Vous avez obtenu {score} bonnes réponses sur {questions.length}.</p>
        
        <div className="flex gap-4">
             <button 
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={20} /> Retour
            </button>
            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
            >
              <RotateCcw size={20} />
              Réessayer
            </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion.correctAnswer;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Question</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentIndex + 1}<span className="text-slate-300 dark:text-slate-600 text-lg">/{questions.length}</span></span>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
            <CheckCircle size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{score} pts</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-snug">
            {currentQuestion.question}
            </h3>

            <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
                let itemClass = "w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden ";
                
                if (isAnswered) {
                if (idx === currentQuestion.correctAnswer) {
                    itemClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300";
                } else if (idx === selectedOption) {
                    itemClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                } else {
                    itemClass += "border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-50";
                }
                } else {
                itemClass += "border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200";
                }

                return (
                <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={isAnswered}
                    className={itemClass}
                >
                    <div className="flex items-center gap-4 z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                            ${isAnswered && idx === currentQuestion.correctAnswer ? 'border-green-500 bg-green-500 text-white' : 
                              isAnswered && idx === selectedOption ? 'border-red-500 bg-red-500 text-white' :
                              'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-500'}
                        `}>
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="font-medium text-lg">{option}</span>
                    </div>
                    
                    {isAnswered && idx === currentQuestion.correctAnswer && <CheckCircle size={24} className="text-green-600 dark:text-green-400 animate-in zoom-in duration-300" />}
                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correctAnswer && <XCircle size={24} className="text-red-600 dark:text-red-400 animate-in zoom-in duration-300" />}
                </button>
                );
            })}
            </div>
        </div>

        {/* Feedback Section - Animated Reveal */}
        <div className={`bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 transition-all duration-500 ease-in-out overflow-hidden ${isAnswered ? 'max-h-96 opacity-100 p-6 md:p-8' : 'max-h-0 opacity-0 py-0 px-6 md:px-8'}`}>
             <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex-1">
                     <div className={`flex items-center gap-2 font-bold mb-2 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                         {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                         <span>{isCorrect ? 'Bonne réponse !' : 'Oups, ce n\'est pas ça.'}</span>
                     </div>
                     <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                        <span className="font-semibold text-slate-900 dark:text-white mr-1">Explication :</span>
                        {currentQuestion.explanation}
                     </p>
                </div>
                
                <button
                    onClick={handleNext}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 active:scale-95"
                >
                    {currentIndex === questions.length - 1 ? 'Voir le résultat' : 'Question suivante'}
                    {currentIndex === questions.length - 1 ? <CheckCircle size={20} /> : <ArrowRight size={20} />}
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default QuizView;
