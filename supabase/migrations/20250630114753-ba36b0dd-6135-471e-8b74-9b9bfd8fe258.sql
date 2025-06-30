
-- Créer la table des catégories de plantes
CREATE TABLE public.plante_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des noms de plantes
CREATE TABLE public.plante_noms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  categorie_id UUID NOT NULL REFERENCES public.plante_categories(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(nom, categorie_id)
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.plante_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plante_noms ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour plante_categories (lecture publique)
CREATE POLICY "Anyone can view plant categories" ON public.plante_categories
  FOR SELECT USING (true);

-- Politiques RLS pour plante_noms (lecture publique)
CREATE POLICY "Anyone can view plant names" ON public.plante_noms
  FOR SELECT USING (true);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE TRIGGER update_plante_categories_updated_at 
  BEFORE UPDATE ON public.plante_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_plante_noms_updated_at 
  BEFORE UPDATE ON public.plante_noms 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer les catégories
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
-- Plantes potagères
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Tomate'), ('Concombre'), ('Poivron'), ('Piment'), ('Carotte'), 
  ('Courgette'), ('Laitue'), ('Salades'), ('Épinard'), ('Haricot vert'), 
  ('Oignon'), ('Ail'), ('Échalote'), ('Betterave'), ('Radis'), ('Chou')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes potagères';

-- Plantes fruitières
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

-- Plantes aromatiques et médicinales
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Menthe'), ('Basilic'), ('Thym'), ('Romarin'), ('Persil'), 
  ('Coriandre'), ('Lavande'), ('Origan'), ('Sauge'), ('Camomille')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes aromatiques et médicinales';

-- Plantes céréalières
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Blé'), ('Orge'), ('Maïs'), ('Riz'), ('Avoine'), ('Seigle'), ('Sorgho'), ('Millet')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes céréalières';

-- Plantes légumineuses
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Lentille'), ('Pois chiche'), ('Haricot'), ('Fève'), ('Soja'), ('Lupin')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes légumineuses';

-- Plantes ornementales
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Rose'), ('Géranium'), ('Hortensia'), ('Tulipe'), ('Tournesol'), 
  ('Bougainvillier'), ('Jasmin'), ('Marguerite'), ('Hibiscus')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes ornementales';

-- Plantes tropicales / exotiques
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Bananier'), ('Papayer'), ('Avocatier'), ('Ananas'), ('Mangue'), 
  ('Caféier'), ('Cacaoyer'), ('Dragon')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes tropicales / exotiques';

-- Plantes de serre
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Tomate cerise'), ('Concombre'), ('Poivron doux'), ('Aubergine'), ('Courgette'), 
  ('Piment'), ('Épinard'), ('Chou chinois'), ('Bette à carde'), ('Radis'), 
  ('Navet'), ('Pak choï'), ('Fraise'), ('Melon'), ('Pastèque (variété naine)'), 
  ('Framboise (hors-saison)'), ('Ananas'), ('Papaye'), ('Basilic'), ('Coriandre'), 
  ('Persil'), ('Ciboulette'), ('Menthe'), ('Thym'), ('Origan'), ('Aneth'), 
  ('Vanille'), ('Curcuma'), ('Gingembre'), ('Piment oiseau'), ('Kalanchoe'), 
  ('Physalis'), ('Orchidée'), ('Bégonia'), ('Anthurium'), ('Fuchsia'), 
  ('Gloxinia'), ('Cyclamen')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes de serre';

-- Plantes industrielles
INSERT INTO public.plante_noms (nom, categorie_id) 
SELECT nom_plante, cat.id 
FROM (VALUES 
  ('Coton'), ('Tabac'), ('Chanvre'), ('Betterave sucrière'), ('Colza'), ('Tournesol')
) AS plantes(nom_plante)
CROSS JOIN public.plante_categories cat 
WHERE cat.nom = 'Plantes industrielles';
