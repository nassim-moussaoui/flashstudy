import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { createPortalSession } from '../services/stripeService';
import { UserProfile } from '../types';
import { User, Calendar, Mail, Save, Loader2, Shield, Trash2, AlertTriangle, X, FileLock2, ChevronRight, Crown } from 'lucide-react';

interface ProfileProps {
  session: any;
  showNotification: (msg: string, type: 'error' | 'success') => void;
  onShowPrivacyPolicy: () => void;
  isVip: boolean;
}

const Profile: React.FC<ProfileProps> = ({ session, showNotification, onShowPrivacyPolicy, isVip }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name, birth_date`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile({
            id: user.id,
            first_name: data.first_name,
            last_name: data.last_name,
            birth_date: data.birth_date,
            email: user.email
        });
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      }
    } catch (error) {
      console.error(error);
      showNotification('Erreur de chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { user } = session;

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      
      showNotification('Profil mis à jour avec succès', 'success');
      // Update local state
      if(profile) {
          setProfile({...profile, first_name: firstName, last_name: lastName});
      }

    } catch (error) {
      console.error(error);
      showNotification('Erreur lors de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'SUPPRIMER') return;
    
    setIsDeleting(true);
    try {
        const userId = session.user.id;

        // 1. Delete Generated Content
        await supabase.from('generated_contents').delete().eq('user_id', userId);
        
        // 2. Delete Courses
        await supabase.from('courses').delete().eq('user_id', userId);
        
        // 3. Delete Folders
        await supabase.from('folders').delete().eq('user_id', userId);
        
        // 4. Delete Profile
        await supabase.from('profiles').delete().eq('id', userId);

        // 5. Sign Out
        await supabase.auth.signOut();
        
        // Note: Actual Auth User deletion usually requires Admin API or Edge Function 
        // depending on Supabase config, but this wipes all user data effectively.
        
        window.location.reload(); // Force reload to clear app state
    } catch (error) {
        console.error("Delete error:", error);
        showNotification("Erreur lors de la suppression des données.", "error");
        setIsDeleting(false);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors de l'ouverture de l'espace de gestion d'abonnement", "error");
      setOpeningPortal(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <User className="text-indigo-600 dark:text-indigo-400" />
            Mon Profil
        </h1>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
            <div className="p-6 md:p-8">
                <form onSubmit={updateProfile} className="space-y-6">
                    
                    {/* Read Only Email */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <Mail size={20} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Adresse Email</p>
                            <p className="text-slate-900 dark:text-white font-medium">{session.user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prénom</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nom</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date de naissance</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                disabled
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                value={profile?.birth_date || ''}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" title="Non modifiable">
                                <Shield size={16} className="text-slate-400" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Pour des raisons de sécurité, la date de naissance n'est pas modifiable.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* SUBSCRIPTION */}
        {isVip && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
              <button
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                  className="w-full flex items-center justify-between gap-4 p-6 md:p-8 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-70"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0">
                          <Crown size={20} fill="currentColor" />
                      </div>
                      <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Abonnement Premium</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez votre moyen de paiement, consultez vos factures ou annulez votre abonnement.</p>
                      </div>
                  </div>
                  {openingPortal ? <Loader2 size={20} className="animate-spin text-slate-400 shrink-0" /> : <ChevronRight size={20} className="text-slate-400 shrink-0" />}
              </button>
          </div>
        )}

        {/* PRIVACY / RGPD */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
            <button
                onClick={onShowPrivacyPolicy}
                className="w-full flex items-center justify-between gap-4 p-6 md:p-8 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <FileLock2 size={20} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Confidentialité & données (RGPD)</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Consultez comment vos données et celles de vos cours sont utilisées.</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-400 shrink-0" />
            </button>
        </div>

        {/* DANGER ZONE */}
        <div className="border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
                <AlertTriangle className="text-red-600 dark:text-red-500" size={20} />
                <h3 className="font-bold text-red-900 dark:text-red-400">Zone de Danger</h3>
            </div>
            <div className="p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Supprimer le compte</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Cette action est irréversible. Elle supprimera définitivement tous vos cours, fiches de révision, quiz et vos données personnelles de nos serveurs (Conformité RGPD).
                </p>
                <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-500 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                    <Trash2 size={18} />
                    Supprimer mon compte
                </button>
            </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 animate-slide-in">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Suppression définitive</h3>
                        </div>
                        <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Pour confirmer la suppression de votre compte et de toutes vos données, veuillez taper <strong className="text-slate-900 dark:text-white select-all">SUPPRIMER</strong> ci-dessous.
                    </p>

                    <input 
                        type="text" 
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Tapez SUPPRIMER"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl mb-6 focus:ring-2 focus:ring-red-500 outline-none font-bold text-center tracking-widest uppercase"
                    />

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation !== 'SUPPRIMER' || isDeleting}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Profile;