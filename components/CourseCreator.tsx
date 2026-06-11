
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Folder, Check, AlertCircle, Type, File as FileIcon, Lock, FolderInput } from 'lucide-react';
import { Folder as FolderType, Course } from '../types';

interface CourseCreatorProps {
  folders: FolderType[];
  courses: Course[];
  currentFolderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; folderId: string | null; type: 'file' | 'text'; content: string | File }) => void;
  onAddExisting: (courseId: string, folderId: string) => void;
  onOpenPricing: () => void;
  isDarkMode: boolean;
  isVip: boolean;
  coursesCount: number;
}

const CourseCreator: React.FC<CourseCreatorProps> = ({ folders, courses, currentFolderId, isOpen, onClose, onCreate, onAddExisting, onOpenPricing, isDarkMode, isVip, coursesCount }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text' | 'existing'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedExistingCourseId, setSelectedExistingCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const FREE_LIMIT = 2;
  const hasReachedLimit = !isVip && coursesCount >= FREE_LIMIT;

  const availableCourses = currentFolderId ? courses.filter(c => c.folderId !== currentFolderId) : [];

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setText('');
      setTitle('');
      setSelectedFolderId(currentFolderId);
      setSelectedExistingCourseId(null);
      setError(null);
      setActiveTab('file');
    }
  }, [isOpen, currentFolderId]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (fileObj: File) => {
    if (fileObj.type !== "application/pdf" && fileObj.type !== "text/plain") {
      setError("Format non supporté (PDF ou TXT uniquement).");
      return;
    }
    if (fileObj.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux (Max 5MB).");
      return;
    }
    setSelectedFile(fileObj);
    setError(null);
    if (!title) {
      const nameWithoutExt = fileObj.name.split('.').slice(0, -1).join('.');
      setTitle(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1).replace(/_/g, ' '));
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'existing') {
      if (!selectedExistingCourseId || !currentFolderId) { setError("Veuillez sélectionner un cours."); return; }
      onAddExisting(selectedExistingCourseId, currentFolderId);
      onClose();
      return;
    }
    if (hasReachedLimit) return;
    if (!title.trim()) { setError("Veuillez donner un titre."); return; }
    if (activeTab === 'file') {
      if (!selectedFile) { setError("Veuillez choisir un fichier."); return; }
      onCreate({ title, folderId: selectedFolderId, type: 'file', content: selectedFile });
    } else {
      if (!text.trim()) { setError("Veuillez coller votre contenu."); return; }
      onCreate({ title, folderId: selectedFolderId, type: 'text', content: text });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] relative">
        {hasReachedLimit && activeTab !== 'existing' && (
          <div className="absolute inset-0 z-50 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-4 text-indigo-600 shadow-lg"><Lock size={32} /></div>
            <h2 className="text-2xl font-bold mb-2">Limite atteinte</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md">Vous avez atteint la limite de {FREE_LIMIT} cours. Passez Premium pour l'illimité.</p>
            <button onClick={() => { onOpenPricing(); onClose(); }} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Débloquer l'illimité</button>
            <button onClick={onClose} className="mt-4 text-sm text-slate-500">Fermer</button>
          </div>
        )}

        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Ajouter un cours</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

          {activeTab !== 'existing' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Titre du cours</label>
              <input type="text" placeholder="Ex: Histoire médiévale" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none" />
            </div>
          )}

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button onClick={() => setActiveTab('file')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${activeTab === 'file' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Fichier (PDF)</button>
            <button onClick={() => setActiveTab('text')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${activeTab === 'text' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Texte Brut</button>
            {currentFolderId && (
              <button onClick={() => setActiveTab('existing')} className={`flex-1 py-2 text-sm font-medium rounded-lg ${activeTab === 'existing' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Cours existant</button>
            )}
          </div>

          <div className="mb-6">
            {activeTab === 'file' ? (
              <div
                className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer ${selectedFile ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700'}`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept=".pdf, .txt" className="hidden" onChange={handleChange} />
                {selectedFile ? (
                  <div className="text-center p-4">
                    <FileIcon size={32} className="text-indigo-600 mx-auto mb-2" />
                    <p className="font-semibold truncate max-w-[200px]">{selectedFile.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="mt-2 text-xs text-red-500 font-bold">Changer</button>
                  </div>
                ) : <div className="text-center text-slate-400"><UploadCloud size={32} className="mx-auto mb-2" /><p>Cliquez ou glissez un fichier</p></div>}
              </div>
            ) : activeTab === 'text' ? (
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Collez votre contenu ici..." className="w-full h-48 p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800 outline-none resize-none" />
            ) : (
              <div className="w-full max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                {availableCourses.length === 0 ? (
                  <p className="p-6 text-sm text-slate-400 text-center">Aucun autre cours disponible à ajouter.</p>
                ) : availableCourses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedExistingCourseId(course.id)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors ${selectedExistingCourseId === course.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <span className="truncate">{course.title}</span>
                    {selectedExistingCourseId === course.id && <Check size={16} className="shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 font-medium text-slate-500">Annuler</button>
          <button onClick={handleSubmit} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2">
            {activeTab === 'existing' ? <><FolderInput size={18} /> Ajouter au dossier</> : "Créer le cours"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCreator;
