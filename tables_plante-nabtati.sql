
-- Créer les types ENUM nécessaires
CREATE TYPE user_role AS ENUM ('viewer', 'admin');
CREATE TYPE competition_status AS ENUM ('upcoming', 'ongoing', 'completed');
CREATE TYPE match_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE player_position AS ENUM ('goalkeeper', 'defender', 'midfielder', 'forward');

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Table profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role user_role DEFAULT 'viewer',
  phone TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table plante_profile
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

-- Table des catégories de plantes
CREATE TABLE public.plante_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des noms de plantes
CREATE TABLE public.plante_noms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  categorie_id UUID NOT NULL REFERENCES public.plante_categories(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(nom, categorie_id)
);

-- Table des variétés de plantes
CREATE TABLE public.plant_varieties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des plantes
CREATE TABLE public.plants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  variety_id UUID REFERENCES public.plant_varieties(id),
  custom_variety TEXT,
  planting_date DATE,
  purchase_price DECIMAL(10,2),
  location TEXT,
  notes TEXT,
  growth INTEGER DEFAULT 0,
  status TEXT DEFAULT 'healthy',
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des photos de plantes
CREATE TABLE public.plant_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des mesures de plantes
CREATE TABLE public.plant_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  height INTEGER,
  width INTEGER,
  notes TEXT,
  measurement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table d'arrosage des plantes
CREATE TABLE public.plant_watering (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  notes TEXT,
  watering_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tables pour le sport (competitions, matches, players, staff, etc.)
CREATE TABLE public.competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  status competition_status DEFAULT 'upcoming',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opponent_team TEXT NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  is_home BOOLEAN DEFAULT true,
  esc_score INTEGER,
  opponent_score INTEGER,
  status match_status DEFAULT 'scheduled',
  competition_id UUID REFERENCES public.competitions(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position player_position NOT NULL,
  jersey_number INTEGER,
  date_of_birth DATE,
  height INTEGER,
  weight INTEGER,
  nationality TEXT DEFAULT 'Tunisia',
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID,
  published BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT DEFAULT 'general',
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer le bucket de stockage pour les photos de plantes
INSERT INTO storage.buckets (id, name, public) VALUES ('plant-photos', 'plant-photos', true);

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plante_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plante_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plante_noms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_watering ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques RLS pour plante_profile
CREATE POLICY "Users can view their own plante profile" ON public.plante_profile
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own plante profile" ON public.plante_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plante profile" ON public.plante_profile
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plante profile" ON public.plante_profile
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour plante_categories (lecture publique)
CREATE POLICY "Anyone can view plant categories" ON public.plante_categories
  FOR SELECT USING (true);

-- Politiques RLS pour plante_noms (lecture publique)
CREATE POLICY "Anyone can view plant names" ON public.plante_noms
  FOR SELECT USING (true);

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

-- Politiques RLS pour plant_measurements
CREATE POLICY "Users can view measurement records for their plants" ON public.plant_measurements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_measurements.plant_id 
    AND plants.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert measurement records for their plants" ON public.plant_measurements
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_measurements.plant_id 
    AND plants.user_id = auth.uid()
  )
);

-- Politiques RLS pour plant_watering
CREATE POLICY "Users can view watering records for their plants" ON public.plant_watering
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_watering.plant_id 
    AND plants.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert watering records for their plants" ON public.plant_watering
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_watering.plant_id 
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

-- Politiques RLS pour les tables publiques (sport)
CREATE POLICY "Anyone can view competitions" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can view staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Anyone can view news articles" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Anyone can view gallery images" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plante_profile_updated_at 
  BEFORE UPDATE ON public.plante_profile 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plante_categories_updated_at 
  BEFORE UPDATE ON public.plante_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plante_noms_updated_at 
  BEFORE UPDATE ON public.plante_noms 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plants_updated_at 
  BEFORE UPDATE ON public.plants 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonctions pour les interactions avec les plantes
CREATE OR REPLACE FUNCTION public.get_plant_watering(plant_uuid UUID)
RETURNS TABLE (
  id UUID,
  amount INTEGER,
  notes TEXT,
  watering_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT w.id, w.amount, w.notes, w.watering_date
  FROM public.plant_watering w
  JOIN public.plants p ON p.id = w.plant_id
  WHERE w.plant_id = plant_uuid AND p.user_id = auth.uid()
  ORDER BY w.watering_date DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_plant_measurements(plant_uuid UUID)
RETURNS TABLE (
  id UUID,
  height INTEGER,
  width INTEGER,
  notes TEXT,
  measurement_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT m.id, m.height, m.width, m.notes, m.measurement_date
  FROM public.plant_measurements m
  JOIN public.plants p ON p.id = m.plant_id
  WHERE m.plant_id = plant_uuid AND p.user_id = auth.uid()
  ORDER BY m.measurement_date DESC;
$$;

CREATE OR REPLACE FUNCTION public.add_plant_watering(
  plant_uuid UUID,
  amount_ml INTEGER,
  note_text TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO public.plant_watering (plant_id, amount, notes)
  SELECT plant_uuid, amount_ml, note_text
  WHERE EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_uuid AND plants.user_id = auth.uid()
  )
  RETURNING id;
$$;

CREATE OR REPLACE FUNCTION public.add_plant_measurement(
  plant_uuid UUID,
  height_cm INTEGER DEFAULT NULL,
  width_cm INTEGER DEFAULT NULL,
  note_text TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO public.plant_measurements (plant_id, height, width, notes)
  SELECT plant_uuid, height_cm, width_cm, note_text
  WHERE EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_uuid AND plants.user_id = auth.uid()
  )
  RETURNING id;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'viewer'
    );
    RETURN NEW;
END;
$$;

-- Insérer les données initiales
INSERT INTO public.plant_varieties (name, category) VALUES
('Cherry Roma', 'Tomate'),
('Genovese', 'Basilic'),
('Purple Top', 'Navet'),
('Detroit Dark Red', 'Betterave'),
('Buttercrunch', 'Laitue'),
('Royal Burgundy', 'Haricot'),
('Early Wonder', 'Épinard'),
('Scarlet Nantes', 'Carotte');

INSERT INTO public.plante_categories (nom) VALUES
('Plantes potagères'),
('Plantes fruitières'),
('Plantes aromatiques et médicinales'),
('Plantes céréalières'),
('Plantes légumineuses'),
('Plantes ornementales'),
('Plantes tropicales / exotiques'),
('Plantes de serre'),
('Plantes industrielles');

-- Insérer les noms de plantes pour chaque catégorie
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Tomate'), ('Concombre'), ('Poivron'), ('Piment'), ('Carotte'), 
  ('Courgette'), ('Laitue'), ('Salades'), ('Épinard'), ('Haricot vert'), 
  ('Oignon'), ('Ail'), ('Échalote'), ('Betterave'), ('Radis'), ('Chou')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes potagères';

INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Pommier'), ('Poirier'), ('Olivier'), ('Vigne'), ('Citronnier'), 
  ('Oranger'), ('Mandariner'), ('Figuier'), ('Grenadier'), ('Pêcher'), 
  ('Nectarine'), ('Cerisier'), ('Framboisier'), ('Mûrier'), ('Cassis'), 
  ('Amande'), ('Avocat'), ('Cerise')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes fruitières';

INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Menthe'), ('Basilic'), ('Thym'), ('Romarin'), ('Persil'), 
  ('Coriandre'), ('Lavande'), ('Origan'), ('Sauge'), ('Camomille')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes aromatiques et médicinales';
