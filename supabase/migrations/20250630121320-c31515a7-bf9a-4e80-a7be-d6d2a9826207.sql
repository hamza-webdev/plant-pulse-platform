
-- Ajouter la colonne photo_url à la table plants si elle n'existe pas déjà
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS photo_url TEXT;
