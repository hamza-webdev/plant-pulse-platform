
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface PlantCategory {
  id: string;
  nom: string;
}

interface PlantName {
  id: string;
  nom: string;
  categorie_id: string;
}

interface PlantCategorySelectorProps {
  onCategoryChange?: (categoryId: string) => void;
  onPlantNameChange?: (plantNameId: string, plantName: string) => void;
  selectedCategory?: string;
  selectedPlantName?: string;
}

const PlantCategorySelector = ({ 
  onCategoryChange, 
  onPlantNameChange, 
  selectedCategory,
  selectedPlantName 
}: PlantCategorySelectorProps) => {
  const [categories, setCategories] = useState<PlantCategory[]>([]);
  const [plantNames, setPlantNames] = useState<PlantName[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchPlantNames(selectedCategory);
    } else {
      setPlantNames([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('plante_categories')
        .select('id, nom')
        .order('nom');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlantNames = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('plante_noms')
        .select('id, nom, categorie_id')
        .eq('categorie_id', categoryId)
        .order('nom');

      if (error) {
        console.error('Error fetching plant names:', error);
      } else {
        setPlantNames(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    onCategoryChange?.(categoryId);
    // Reset plant name selection when category changes
    onPlantNameChange?.('', '');
  };

  const handlePlantNameChange = (plantNameId: string) => {
    const selectedPlant = plantNames.find(plant => plant.id === plantNameId);
    onPlantNameChange?.(plantNameId, selectedPlant?.nom || '');
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Chargement des catégories...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Catégorie de plante</Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && (
        <div>
          <Label htmlFor="plantName">Nom de la plante</Label>
          <Select value={selectedPlantName} onValueChange={handlePlantNameChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une plante" />
            </SelectTrigger>
            <SelectContent>
              {plantNames.map((plant) => (
                <SelectItem key={plant.id} value={plant.id}>
                  {plant.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default PlantCategorySelector;
