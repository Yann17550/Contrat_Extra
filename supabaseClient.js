// Ce fichier permet de connecter votre interface à votre base de données Supabase
import { createClient } from '@supabase/supabase-client';

// Vos identifiants de connexion
const supabaseUrl = 'https://qnhhdpzsqbxqtnjaotyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_8IDFqfojn8sKehp-g6cK_Q_8NJAEXqT';

/**
 * Initialisation du client. 
 * C'est lui qui fera le travail d'envoyer les contrats signés dans vos tables.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
