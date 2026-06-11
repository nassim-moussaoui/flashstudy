import { supabase } from './supabaseClient';

export const createCheckoutSession = async (): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('create-checkout-session');

  if (error) throw error;
  if (!data?.url) throw new Error("Impossible de créer la session de paiement.");

  return data.url as string;
};

export const createPortalSession = async (): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('create-portal-session');

  if (error) throw error;
  if (!data?.url) throw new Error("Impossible d'ouvrir l'espace de gestion d'abonnement.");

  return data.url as string;
};
