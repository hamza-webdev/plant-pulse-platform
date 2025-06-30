
-- Créer la table plante_profile pour les profils utilisateurs spécifiques aux plantes
CREATE TABLE public.plante_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur la nouvelle table
ALTER TABLE public.plante_profile ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour plante_profile
CREATE POLICY "Users can view their own plante profile" ON public.plante_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plante profile" ON public.plante_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plante profile" ON public.plante_profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plante profile" ON public.plante_profile
  FOR DELETE USING (auth.uid() = user_id);

-- Ajouter le trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE TRIGGER update_plante_profile_updated_at 
  BEFORE UPDATE ON public.plante_profile 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
