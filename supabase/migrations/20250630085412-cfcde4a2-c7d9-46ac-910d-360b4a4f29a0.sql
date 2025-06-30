
-- Créer la table des variétés de plantes
CREATE TABLE public.plant_varieties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer quelques variétés par défaut
INSERT INTO public.plant_varieties (name, category) VALUES
('Cherry Roma', 'Tomate'),
('Genovese', 'Basilic'),
('Purple Top', 'Navet'),
('Detroit Dark Red', 'Betterave'),
('Buttercrunch', 'Laitue'),
('Royal Burgundy', 'Haricot'),
('Early Wonder', 'Épinard'),
('Scarlet Nantes', 'Carotte');

-- Mettre à jour la table profiles pour inclure les informations personnelles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Créer la table des plantes avec référence aux variétés
CREATE TABLE public.plants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  variety_id UUID REFERENCES public.plant_varieties(id),
  custom_variety TEXT, -- Pour les variétés personnalisées
  planting_date DATE,
  purchase_price DECIMAL(10,2),
  location TEXT,
  notes TEXT,
  growth INTEGER DEFAULT 0,
  status TEXT DEFAULT 'healthy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des photos de plantes
CREATE TABLE public.plant_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer un bucket de stockage pour les photos
INSERT INTO storage.buckets (id, name, public) VALUES ('plant-photos', 'plant-photos', true);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.plant_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_photos ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour plant_varieties (lecture publique)
CREATE POLICY "Anyone can view plant varieties" ON public.plant_varieties
  FOR SELECT USING (true);

-- Politiques RLS pour plants
CREATE POLICY "Users can view their own plants" ON public.plants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plants" ON public.plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants" ON public.plants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants" ON public.plants
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour plant_photos
CREATE POLICY "Users can view photos of their plants" ON public.plant_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.plants 
      WHERE plants.id = plant_photos.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create photos for their plants" ON public.plant_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plants 
      WHERE plants.id = plant_photos.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of their plants" ON public.plant_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.plants 
      WHERE plants.id = plant_photos.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their plants" ON public.plant_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.plants 
      WHERE plants.id = plant_photos.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

-- Politiques pour le stockage des photos
CREATE POLICY "Users can upload plant photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'plant-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view plant photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'plant-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their plant photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'plant-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their plant photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'plant-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la table profiles
CREATE OR REPLACE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour la table plants
CREATE OR REPLACE TRIGGER update_plants_updated_at 
  BEFORE UPDATE ON public.plants 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
