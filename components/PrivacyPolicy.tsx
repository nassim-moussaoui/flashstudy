import React from 'react';
import { X, ShieldCheck, Database, Cookie, Sparkles, Mail, Trash2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-indigo-600" size={22} /> Politique de confidentialité (RGPD)</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Chez <strong>FlashStudy</strong>, nous accordons une grande importance à la protection de vos données personnelles.
            Cette page explique de manière simple et transparente quelles données nous collectons, pourquoi, et comment elles sont utilisées,
            conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Database size={16} className="text-indigo-600" /> Données que nous collectons</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Informations de compte</strong> : adresse email, prénom, nom, date de naissance, mot de passe (chiffré).</li>
              <li><strong>Contenus de cours</strong> : les fichiers (PDF, TXT) ou textes que vous téléversez pour générer des révisions.</li>
              <li><strong>Contenus générés</strong> : quiz, flashcards, fiches de révision et conversations avec l'assistant IA, liés à vos cours.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Sparkles size={16} className="text-indigo-600" /> Pourquoi nous utilisons ces données</h3>
            <p className="mb-2">
              Vos données sont utilisées <strong>uniquement pour faire fonctionner le service</strong>, et notamment pour :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Créer et gérer votre compte et votre espace personnel de révision.</li>
              <li>Générer automatiquement des <strong>quiz</strong>, des <strong>flashcards</strong> et des <strong>fiches de révision</strong> à partir du contenu de vos cours.</li>
              <li>Vous permettre de discuter avec l'assistant IA à propos de vos cours.</li>
            </ul>
            <p className="mt-2">
              Nous n'utilisons jamais vos données à des fins publicitaires et ne les revendons à aucun tiers.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-600" /> Partage avec des prestataires tiers</h3>
            <p className="mb-2">
              Pour générer les quiz, flashcards et fiches de révision, le <strong>contenu de vos cours</strong> (texte ou fichier téléversé)
              est transmis à l'API <strong>Google Gemini</strong> (Google AI), qui agit comme sous-traitant technique pour le traitement par intelligence artificielle.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Seul le contenu nécessaire à la génération est envoyé (le cours concerné), pas l'ensemble de votre compte.</li>
              <li>Vos identifiants de connexion et mot de passe ne sont jamais transmis à Google.</li>
              <li>Le stockage de votre compte, vos cours et vos contenus générés est assuré par <strong>Supabase</strong>, notre prestataire de base de données.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Cookie size={16} className="text-indigo-600" /> Cookies</h3>
            <p>
              FlashStudy utilise uniquement des cookies / stockage local <strong>strictement nécessaires</strong> au fonctionnement du site :
              maintien de votre session de connexion et mémorisation de vos préférences (thème clair/sombre, consentement à cette politique).
              Nous n'utilisons aucun cookie publicitaire ou de traçage à des fins marketing.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Trash2 size={16} className="text-indigo-600" /> Conservation et suppression des données</h3>
            <p>
              Vos données sont conservées tant que votre compte est actif. Vous pouvez à tout moment demander la suppression de votre compte
              et de l'ensemble des données associées (cours, contenus générés, informations de profil) depuis votre espace Profil ou en nous contactant.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-600" /> Vos droits</h3>
            <p className="mb-2">Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Droit d'accès et de rectification de vos données.</li>
              <li>Droit à l'effacement ("droit à l'oubli").</li>
              <li>Droit à la portabilité de vos données.</li>
              <li>Droit d'opposition et de limitation du traitement.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Mail size={16} className="text-indigo-600" /> Contact</h3>
            <p>
              Pour toute question relative à vos données personnelles ou pour exercer vos droits, contactez-nous à l'adresse :{' '}
              <a href="mailto:contact@flashstudy.app" className="text-indigo-600 hover:underline">contact@flashstudy.app</a>.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg">J'ai compris</button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
