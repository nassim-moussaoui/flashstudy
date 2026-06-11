import { createClient } from '@supabase/supabase-js';

// Récupération des clés depuis l'environnement (ou fallback sur les valeurs fournies pour la démo)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://drbkbkytghffqlppxaqb.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtia3l0Z2hmZnFscHB4YXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjM3NjQsImV4cCI6MjA3OTU5OTc2NH0.2pDgJPhhdJFDkON1QJ1orxweycMfPOxnqv3j7h8Nzog';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Mémoriser la session dans le localStorage
    autoRefreshToken: true, // Rafraîchir le token automatiquement
    detectSessionInUrl: true
  }
});