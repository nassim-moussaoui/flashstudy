
import React, { useState, useEffect } from 'react';
import { 
  BookOpen,
  LayoutDashboard,
  PlusCircle, 
  Sparkles, 
  ChevronRight,
  File as FileIcon,
  Trash2,
  Menu,
  X,
  Moon,
  Sun,
  FolderOpen,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Settings,
  AlertTriangle,
  Calendar,
  Layers,
  MessageCircle,
  Search,
  Flame,
  Plus,
  Shield,
  Crown
} from 'lucide-react';
import { Course, GeneratedContent, ContentType, QuizQuestion, Folder, FlashcardItem } from './types';
import { generateQuiz, generateSummary } from './services/aiService';
import { supabase } from './services/supabaseClient';
import QuizView from './components/QuizView';
import Auth from './components/Auth';
import Profile from './components/Profile';
import RevisionSheet from './components/RevisionSheet';
import CourseChat from './components/CourseChat';
import CourseCreator from './components/CourseCreator';
import Pricing from './components/Pricing';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieConsent from './components/CookieConsent';
import LandingPage from './components/LandingPage';

const App = () => {
  // --- STATE ---
  // Auth & User Profile
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [userName, setUserName] = useState<string>('');
  const [isVip, setIsVip] = useState(false);

  // Theme & Layout
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'profile' | 'pricing'>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [viewingContent, setViewingContent] = useState<GeneratedContent | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Creation Flow
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  
  // New Folder Flow
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Search Flow
  const [searchQuery, setSearchQuery] = useState('');

  // UI Notifications & Modals
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<{isOpen: boolean, folderId: string, folderName: string} | null>(null);
  const [deleteCourseConfirm, setDeleteCourseConfirm] = useState<{isOpen: boolean, courseId: string, courseTitle: string} | null>(null);
  const [deleteContentConfirm, setDeleteContentConfirm] = useState<{isOpen: boolean, contentId: string, contentTitle: string} | null>(null);

  // LIMITS CONSTANTS
  const FREE_COURSE_LIMIT = 2;
  const FREE_GEN_LIMIT = 3;

  // --- AUTH & INIT EFFECT ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- DATA LOADING EFFECT ---
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  // --- STRIPE CHECKOUT REDIRECT HANDLING ---
  useEffect(() => {
    if (!session) return;

    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    if (!checkoutStatus) return;

    window.history.replaceState({}, '', window.location.pathname);

    if (checkoutStatus === 'success') {
      showNotification("Paiement reçu ! Activation de votre abonnement Premium...", "success");
      setActiveTab('dashboard');

      // Le webhook Stripe peut prendre quelques secondes pour activer le compte VIP
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_vip')
          .eq('id', session.user.id)
          .single();

        if (profileData?.is_vip) {
          setIsVip(true);
          showNotification("Félicitations ! Vous êtes maintenant Premium.", "success");
          clearInterval(interval);
        } else if (attempts >= 8) {
          clearInterval(interval);
        }
      }, 2000);
    } else if (checkoutStatus === 'cancel') {
      showNotification("Paiement annulé.", "error");
    }
  }, [session]);

  const fetchData = async () => {
    if (!session?.user) return;

    setIsLoadingData(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, is_vip')
        .eq('id', session.user.id)
        .single();
      
      if (profileData) {
        setUserName(profileData.first_name || 'Étudiant');
        setIsVip(!!profileData.is_vip);
      } else {
        setUserName(session.user.user_metadata?.first_name || session.user.email?.split('@')[0] || 'Étudiant');
        setIsVip(false);
      }

      const { data: foldersData } = await supabase.from('folders').select('*').order('created_at', { ascending: true });
      if (foldersData) setFolders(foldersData);

      const { data: coursesData } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      
      const mappedCourses: Course[] = (coursesData || []).map((c: any) => ({
        id: c.id,
        folderId: c.folder_id,
        title: c.title,
        subject: c.subject,
        color: 'bg-indigo-500', 
        createdAt: new Date(c.created_at).getTime(),
        content: c.content,
        fileData: c.file_data ? {
          mimeType: c.file_data.mimeType,
          data: c.file_data.data,
          fileName: c.file_data.fileName
        } : undefined
      }));
      setCourses(mappedCourses);

      const { data: contentData } = await supabase.from('generated_contents').select('*').neq('type', 'PODCAST').order('created_at', { ascending: false });
      const mappedContent: GeneratedContent[] = (contentData || []).map((c: any) => ({
        id: c.id,
        courseId: c.course_id,
        type: c.type as ContentType,
        title: c.title,
        createdAt: new Date(c.created_at).getTime(),
        data: c.data
      }));
      setGeneratedContent(mappedContent);

    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Erreur de chargement des données", "error");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAuthView('landing');
    setCourses([]);
    setFolders([]);
    setGeneratedContent([]);
    setUserName('');
    setIsVip(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const checkCourseLimit = () => {
    if (isVip) return true;
    if (courses.length >= FREE_COURSE_LIMIT) {
      setIsCreatorOpen(true);
      return false;
    }
    return true;
  };

  const checkGenLimit = () => {
    if (isVip) return true;
    if (generatedContent.length >= FREE_GEN_LIMIT) {
      setActiveTab('pricing');
      setViewingContent(null);
      setSelectedCourseId(null);
      return false;
    }
    return true;
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        const { data, error } = await supabase.from('folders').insert([
          { user_id: session.user.id, name: newFolderName }
        ]).select();

        if (error) throw error;

        if (data) {
          setFolders([...folders, data[0]]);
          setNewFolderName('');
          setShowNewFolderInput(false);
          showNotification("Dossier créé avec succès !", "success");
        }
      } catch (error) {
        showNotification("Erreur lors de la création du dossier", "error");
      }
    }
  };

  const requestDeleteFolder = (folderId: string, folderName: string) => {
    setDeleteFolderConfirm({ isOpen: true, folderId, folderName });
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderConfirm) return;
    const { folderId } = deleteFolderConfirm;
    try {
      await supabase.from('courses').update({ folder_id: null }).eq('folder_id', folderId);
      await supabase.from('folders').delete().eq('id', folderId);
      setFolders(folders.filter(f => f.id !== folderId));
      setCourses(courses.map(c => c.folderId === folderId ? { ...c, folderId: undefined } : c));
      if (selectedFolderId === folderId) setSelectedFolderId('all');
      showNotification("Dossier supprimé.", "success");
    } catch (error) {
      showNotification("Impossible de supprimer le dossier.", "error");
    } finally {
      setDeleteFolderConfirm(null);
    }
  };

  const requestDeleteCourse = (courseId: string, courseTitle: string) => {
      setDeleteCourseConfirm({ isOpen: true, courseId, courseTitle });
  };

  const confirmDeleteCourse = async () => {
      if (!deleteCourseConfirm) return;
      const { courseId } = deleteCourseConfirm;
      try {
          await supabase.from('courses').delete().eq('id', courseId);
          setCourses(courses.filter(c => c.id !== courseId));
          setGeneratedContent(generatedContent.filter(gc => gc.courseId !== courseId));
          if (selectedCourseId === courseId) setSelectedCourseId(null);
          showNotification("Cours supprimé avec succès.", "success");
      } catch (error) {
          showNotification("Erreur lors de la suppression.", "error");
      } finally {
          setDeleteCourseConfirm(null);
      }
  };

  const requestDeleteContent = (contentId: string, contentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteContentConfirm({ isOpen: true, contentId, contentTitle });
  };

  const confirmDeleteContent = async () => {
    if(!deleteContentConfirm) return;
    const { contentId } = deleteContentConfirm;
    try {
      await supabase.from('generated_contents').delete().eq('id', contentId);
      setGeneratedContent(generatedContent.filter(c => c.id !== contentId));
      showNotification("Contenu supprimé.", "success");
    } catch (error) {
      showNotification("Erreur lors de la suppression.", "error");
    } finally {
      setDeleteContentConfirm(null);
    }
  };

  const handleCreateCourse = async (courseData: { title: string; folderId: string | null; type: 'file' | 'text'; content: string | File }) => {
    if (!checkCourseLimit()) return;
    try {
      let filePayload = null;
      let textContent = null;
      if (courseData.type === 'file' && courseData.content instanceof File) {
         const file = courseData.content;
         const base64Promise = new Promise<{data: string, mime: string, name: string}>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target?.result as string;
                resolve({
                    data: base64String.split(',')[1],
                    mime: file.type,
                    name: file.name
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
         });
         const result = await base64Promise;
         filePayload = { mimeType: result.mime, data: result.data, fileName: result.name };
      } else {
        textContent = courseData.content as string;
      }

      const { data, error } = await supabase.from('courses').insert([{
        user_id: session.user.id,
        folder_id: courseData.folderId,
        title: courseData.title,
        subject: 'Nouveau cours',
        content: textContent,
        file_data: filePayload
      }]).select();
      
      if (error) throw error;
      if (data) {
        const createdCourse = data[0];
        setCourses([{
          id: createdCourse.id,
          folderId: createdCourse.folder_id,
          title: createdCourse.title,
          subject: createdCourse.subject,
          color: 'bg-indigo-500',
          createdAt: new Date(createdCourse.created_at).getTime(),
          content: createdCourse.content,
          fileData: createdCourse.file_data
        }, ...courses]);
        setActiveTab('courses');
        setSelectedCourseId(createdCourse.id);
        showNotification("Cours ajouté avec succès !", "success");
      }
    } catch (error) {
      showNotification("Erreur lors de la sauvegarde du cours", "error");
    }
  };

  const handleAddExistingCourseToFolder = async (courseId: string, folderId: string) => {
    try {
      const { error } = await supabase.from('courses').update({ folder_id: folderId }).eq('id', courseId);
      if (error) throw error;
      setCourses(courses.map((c: Course) => c.id === courseId ? { ...c, folderId } : c));
      showNotification("Cours ajouté au dossier !", "success");
    } catch (error) {
      showNotification("Erreur lors de l'ajout du cours au dossier", "error");
    }
  };

  const handleGenerate = async (type: ContentType) => {
    if (!checkGenLimit()) return;
    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;
    setIsGenerating(true);
    try {
      let genData: any;
      let title = "";
      if (type === ContentType.QUIZ) {
        genData = await generateQuiz(course);
        title = `Quiz: ${course.title}`;
      } else {
        genData = await generateSummary(course);
        title = `Flashcards: ${course.title}`;
      }
      const { data: savedContent, error } = await supabase.from('generated_contents').insert([{
        user_id: session.user.id,
        course_id: course.id,
        type: type,
        title: title,
        data: genData
      }]).select();
      if (error) throw error;
      if (savedContent) {
        const content: GeneratedContent = {
          id: savedContent[0].id,
          courseId: course.id,
          type,
          title,
          createdAt: new Date(savedContent[0].created_at).getTime(),
          data: genData
        };
        setGeneratedContent([content, ...generatedContent]);
        setViewingContent(content); 
        showNotification("Contenu généré avec succès !", "success");
      }
    } catch (e) {
      console.error("Erreur de génération:", e);
      showNotification("Le service IA est momentanément surchargé. Veuillez réessayer dans quelques instants.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-indigo-500" size={32}/></div>;
  }

  if (!session) {
    return (
      <>
        {authView === 'landing' ? (
          <LandingPage
            onLogin={() => setAuthView('login')}
            onSignup={() => setAuthView('signup')}
            onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        ) : (
          <Auth
            onLoginSuccess={() => {}}
            onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
            initialIsSignUp={authView === 'signup'}
            onBack={() => setAuthView('landing')}
          />
        )}
        <CookieConsent onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)} />
        {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      </>
    );
  }

  const filteredCourses = courses.filter(course => {
      const matchFolder = selectedFolderId === 'all' || course.folderId === selectedFolderId;
      const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFolder && matchSearch;
  });

  return (
    <>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">

      {toast && (
        <div className={`fixed bottom-4 right-4 md:right-8 z-[120] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-in transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
          <div>
            <p className="font-bold text-sm">{toast.type === 'error' ? 'Erreur' : 'Succès'}</p>
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-2 hover:bg-white/20 p-1 rounded-full"><X size={16} /></button>
        </div>
      )}

      <CourseCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onCreate={handleCreateCourse}
        onAddExisting={handleAddExistingCourseToFolder}
        onOpenPricing={() => setActiveTab('pricing')}
        folders={folders}
        courses={courses}
        currentFolderId={selectedFolderId !== 'all' ? selectedFolderId : null}
        isDarkMode={isDarkMode}
        isVip={isVip}
        coursesCount={courses.length}
      />

      {/* Modals Suppression */}
      {deleteFolderConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-500"><AlertTriangle size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Supprimer le dossier ?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Les cours seront déplacés dans "Tous les cours".</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteFolderConfirm(null)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Annuler</button>
              <button onClick={confirmDeleteFolder} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {deleteCourseConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-500"><AlertTriangle size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Supprimer ce cours ?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteCourseConfirm(null)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Annuler</button>
              <button onClick={confirmDeleteCourse} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {deleteContentConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-500"><AlertTriangle size={24} /></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Supprimer le contenu ?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Voulez-vous vraiment supprimer "{deleteContentConfirm.contentTitle}" ?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteContentConfirm(null)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600">Annuler</button>
              <button onClick={confirmDeleteContent} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img src="/img/flash-study-logo.png" alt="FlashStudy" className="w-9 h-9 object-contain" />
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">FlashStudy</span>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>

        <div className="p-4">
            <button 
                onClick={() => { setIsCreatorOpen(true); closeSidebar(); }}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
            >
                <PlusCircle size={20} /> Ajouter un cours
            </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <button onClick={() => { setActiveTab('dashboard'); setSelectedCourseId(null); setViewingContent(null); closeSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><LayoutDashboard size={18} /> Tableau de bord</button>
          <button onClick={() => { setActiveTab('courses'); setSelectedFolderId('all'); setSelectedCourseId(null); setViewingContent(null); closeSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'courses' && selectedFolderId === 'all' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><BookOpen size={18} /> Tous les cours</button>
          
          <div className="pt-6 pb-2">
             <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dossiers</h3>
                <button onClick={() => setShowNewFolderInput(!showNewFolderInput)} className="text-slate-400 hover:text-indigo-500"><Plus size={14} /></button>
             </div>
             {showNewFolderInput && (
                <div className="px-4 mb-2">
                <input autoFocus type="text" placeholder="Nom..." className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded text-sm px-2 py-1" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()} onBlur={() => !newFolderName && setShowNewFolderInput(false)} />
                </div>
             )}
             <div className="space-y-0.5">
                {folders.map(folder => (
                <div key={folder.id} className="relative group flex items-center">
                    <button onClick={() => { setSelectedFolderId(folder.id); setActiveTab('courses'); setSelectedCourseId(null); setViewingContent(null); closeSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${selectedFolderId === folder.id ? 'bg-slate-100 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>
                        <FolderOpen size={16} /> <span className="truncate flex-1 text-left">{folder.name}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); requestDeleteFolder(folder.id, folder.name); }} className="absolute right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
                ))}
             </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
           {!isVip && (
              <div onClick={() => { setActiveTab('pricing'); setViewingContent(null); setSelectedCourseId(null); closeSidebar(); }} className={`mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform ${activeTab === 'pricing' ? 'ring-2 ring-white ring-offset-2 ring-offset-indigo-600' : ''}`}>
                  <div className="flex items-center gap-2 mb-1"><Crown size={16} fill="currentColor" /><span className="text-xs font-bold uppercase tracking-wider">Passez Premium</span></div>
                  <p className="text-[10px] opacity-90">Débloquez l'illimité et le Chat IA.</p>
              </div>
           )}
           <button onClick={() => { setActiveTab('profile'); setViewingContent(null); closeSidebar(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-2 ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><User size={16} /><span className="truncate flex-1 text-left">{userName || session.user.email}</span></button>
           <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors text-sm"><LogOut size={16} /> Déconnexion</button>
           <button onClick={() => setShowPrivacyPolicy(true)} className="w-full text-center mt-3 text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors">Politique de confidentialité (RGPD)</button>
        </div>
      </div>

      <main className="flex-1 flex flex-col md:ml-72 min-h-screen transition-all duration-300">
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-600 dark:text-slate-300"><Menu size={24} /></button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
              {viewingContent ? 'Mode Révision' : activeTab === 'dashboard' ? 'Tableau de bord' : activeTab === 'profile' ? 'Mon Profil' : activeTab === 'pricing' ? 'Offres Premium' : 'Mes Cours'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {isLoadingData ? (
             <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-600 mb-4" size={32} /><p className="text-slate-500">Chargement...</p></div>
          ) : activeTab === 'profile' ? (
              <Profile session={session} showNotification={showNotification} onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)} isVip={isVip} />
          ) : activeTab === 'pricing' ? (
              <Pricing showNotification={showNotification} />
          ) : viewingContent ? (
             <div className="animate-fade-in">
              <button onClick={() => setViewingContent(null)} className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600">← Retour</button>
              {viewingContent.type === ContentType.QUIZ && (
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-6"><Sparkles className="text-indigo-500" /> {viewingContent.title}</h1>
                   <QuizView questions={viewingContent.data as QuizQuestion[]} onClose={() => setViewingContent(null)} />
                </div>
              )}
              {viewingContent.type === ContentType.SUMMARY && (
                <RevisionSheet content={viewingContent.data as FlashcardItem[]} title={viewingContent.title.replace('Flashcards: ', '')} onClose={() => setViewingContent(null)} />
              )}
            </div>
          ) : activeTab === 'dashboard' ? (
            <div className="animate-fade-in space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">Bonjour, {userName} 👋 {isVip && <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1"><Crown size={12} fill="white" /> VIP</span>}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Prêt à réviser ? Voici un résumé de votre activité.</p>
                </div>
                <div className="flex gap-2">
                    {!isVip && <button onClick={() => setActiveTab('pricing')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-transform hover:scale-105"><Shield size={18} /> Premium</button>}
                    <button onClick={() => setIsCreatorOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20"><PlusCircle size={18} /> Nouveau Cours</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-5">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400"><BookOpen size={28}/></div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{courses.length} <span className="text-sm font-normal text-slate-400">/ {isVip ? '∞' : FREE_COURSE_LIMIT}</span></div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Cours importés</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-5">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400"><Sparkles size={28}/></div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{generatedContent.length} <span className="text-sm font-normal text-slate-400">/ {isVip ? '∞' : FREE_GEN_LIMIT}</span></div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Flashcards & Quiz</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dernières Révisions</h2>
                {generatedContent.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedContent.slice(0, 6).map(content => (
                      <div key={content.id} onClick={() => setViewingContent(content)} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-lg ${content.type === 'QUIZ' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>{content.type === 'QUIZ' ? <Sparkles size={20} /> : <Layers size={20} />}</div>
                            <div>
                              <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{content.title}</h3>
                              <p className="text-xs text-slate-500 mt-1">Il y a {Math.floor((Date.now() - content.createdAt) / (1000 * 60))} min</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">Aucune révision récente.</div>
                )}
              </div>
            </div>
          ) : selectedCourseId ? (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                   <button onClick={() => { setSelectedCourseId(null); setIsChatOpen(false); }} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">← Retour aux cours</button>
                   <button onClick={() => { const c = courses.find(course => course.id === selectedCourseId); if(c) requestDeleteCourse(c.id, c.title); }} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/10 rounded-lg"><Trash2 size={14} /> Supprimer le cours</button>
                </div>
                {(() => {
                  const course = courses.find(c => c.id === selectedCourseId);
                  if (!course) return null;
                  const courseContentList = generatedContent.filter(gc => gc.courseId === course.id);
                  return (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-white dark:from-slate-800 dark:to-slate-800">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{course.title}</h1>
                        </div>
                        <div className="p-8">
                            <h3 className="text-lg font-semibold mb-6">Outils IA</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button onClick={() => handleGenerate(ContentType.SUMMARY)} disabled={isGenerating} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all text-left bg-slate-50 dark:bg-slate-800/50 disabled:opacity-50">
                                    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Layers size={24} /></div>
                                    <div className="font-bold">Flashcards</div>
                                    <div className="text-xs text-slate-500 mt-1">Mémorisation active</div>
                                </button>
                                <button onClick={() => handleGenerate(ContentType.QUIZ)} disabled={isGenerating} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all text-left bg-slate-50 dark:bg-slate-800/50 disabled:opacity-50">
                                    <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Sparkles size={24} /></div>
                                    <div className="font-bold">Quiz Interactif</div>
                                    <div className="text-xs text-slate-500 mt-1">Tester mes connaissances</div>
                                </button>
                                <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-5 rounded-2xl border transition-all text-left bg-slate-50 dark:bg-slate-800/50 ${isChatOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-400'}`}>
                                    <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><MessageCircle size={24} /></div>
                                    <div className="font-bold">Assistant IA</div>
                                    <div className="text-xs text-slate-500 mt-1">{isVip ? "Discuter avec le cours" : "🔒 Réservé VIP"}</div>
                                </button>
                            </div>
                            {isChatOpen && <div className="mb-8 animate-fade-in"><CourseChat course={course} onClose={() => setIsChatOpen(false)} isVip={isVip} onOpenPricing={() => setActiveTab('pricing')} /></div>}
                            {isGenerating && <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-8 border border-slate-200 dark:border-slate-700"><Sparkles className="animate-spin text-indigo-500 w-8 h-8 mb-4" /><span className="text-slate-700 dark:text-slate-200 font-medium text-lg">L'IA travaille...</span></div>}
                            <div className="mb-8">
                              <h3 className="text-lg font-semibold mb-4">Mes Révisions</h3>
                              {courseContentList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {courseContentList.map(content => (
                                    <div key={content.id} onClick={() => setViewingContent(content)} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all cursor-pointer group relative">
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${content.type === 'QUIZ' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>{content.type === 'QUIZ' ? <Sparkles size={20} /> : <Layers size={20} />}</div>
                                            <div><h4 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{content.title}</h4><p className="text-xs text-slate-500 mt-1">Généré le {new Date(content.createdAt).toLocaleDateString()}</p></div>
                                          </div>
                                          <button onClick={(e) => requestDeleteContent(content.id, content.title, e)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-sm text-slate-500">Pas encore de contenu généré.</p>}
                            </div>
                        </div>
                    </div>
                  );
                })()}
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">{selectedFolderId === 'all' ? 'Bibliothèque de Cours' : folders.find(f => f.id === selectedFolderId)?.name}</h1>
                  <div className="md:hidden w-full relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500" /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <button onClick={() => setIsCreatorOpen(true)} className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 h-[180px] transition-all">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3"><Plus size={24} /></div>
                      <span className="font-semibold">Ajouter un cours</span>
                  </button>

                  {filteredCourses.map(course => (
                      <div key={course.id} onClick={() => setSelectedCourseId(course.id)} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all cursor-pointer group relative h-[180px] flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4"><div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600"><BookOpen size={24} /></div><span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 px-2 py-1 rounded-full">{course.fileData ? 'PDF' : 'TEXTE'}</span></div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2">{course.title}</h3>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); requestDeleteCourse(course.id, course.title); }} className="absolute bottom-6 right-6 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                      </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    <CookieConsent onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)} />
    {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
    </>
  );
};

export default App;
