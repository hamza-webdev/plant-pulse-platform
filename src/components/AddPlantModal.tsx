
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Camera, Calendar, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (plantData: any) => void;
}

interface PlantVariety {
  id: string;
  name: string;
  category: string;
}

const AddPlantModal = ({ isOpen, onClose, onAddPlant }: AddPlantModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    variety_id: "",
    custom_variety: "",
    planting_date: "",
    purchase_price: "",
    location: "",
    notes: ""
  });
  const [varieties, setVarieties] = useState<PlantVariety[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchVarieties();
    }
  }, [isOpen]);

  const fetchVarieties = async () => {
    try {
      const { data, error } = await supabase
        .from('plant_varieties')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching varieties:', error);
      } else {
        setVarieties(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast({
        title: "Limite dépassée",
        description: "Vous ne pouvez ajouter que 5 photos maximum",
        variant: "destructive"
      });
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Créer les aperçus
    const newPreviews = [...previews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const uploadPhotos = async (plantId: string, userId: string) => {
    const uploadPromises = selectedFiles.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${plantId}/${Date.now()}-${index}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('plant-photos')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('plant-photos')
        .getPublicUrl(fileName);

      return {
        photo_url: urlData.publicUrl,
        is_primary: index === 0 // La première photo est la principale
      };
    });

    const uploadResults = await Promise.all(uploadPromises);
    return uploadResults.filter(result => result !== null);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleInputChange("location", `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast({
            title: "Position récupérée",
            description: "Votre position GPS a été ajoutée",
          });
        },
        (error) => {
          toast({
            title: "Erreur de géolocalisation",
            description: "Impossible de récupérer votre position",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || (!formData.variety_id && !formData.custom_variety)) {
      toast({
        title: "Champs requis manquants",
        description: "Veuillez remplir le nom et la variété",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Créer la plante d'abord
      const plantData = {
        name: formData.name,
        variety_id: formData.variety_id || null,
        custom_variety: formData.custom_variety || null,
        planting_date: formData.planting_date || null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        location: formData.location,
        notes: formData.notes,
        growth: 0,
        status: 'healthy'
      };

      // D'abord, on obtient l'ID utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Insérer la plante
      const { data: newPlant, error: plantError } = await supabase
        .from('plants')
        .insert([{ ...plantData, user_id: user.id }])
        .select('*')
        .single();

      if (plantError) {
        throw plantError;
      }

      // Upload des photos si présentes
      if (selectedFiles.length > 0) {
        const photoUrls = await uploadPhotos(newPlant.id, user.id);
        
        if (photoUrls.length > 0) {
          const photosData = photoUrls.map(photo => ({
            plant_id: newPlant.id,
            photo_url: photo.photo_url,
            is_primary: photo.is_primary
          }));

          const { error: photosError } = await supabase
            .from('plant_photos')
            .insert(photosData);

          if (photosError) {
            console.error('Error saving photos:', photosError);
          }
        }
      }

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        variety_id: "",
        custom_variety: "",
        planting_date: "",
        purchase_price: "",
        location: "",
        notes: ""
      });
      setSelectedFiles([]);
      setPreviews([]);

      onAddPlant(newPlant);
    } catch (error) {
      console.error('Error adding plant:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la plante",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Ajouter une nouvelle plante
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom de la plante */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la plante *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="ex: Tomates, Basilic, Menthe..."
              required
            />
          </div>

          {/* Variété */}
          <div className="space-y-2">
            <Label htmlFor="variety">Variété *</Label>
            <Select
              value={formData.variety_id}
              onValueChange={(value) => {
                handleInputChange("variety_id", value);
                if (value !== "custom") {
                  handleInputChange("custom_variety", "");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une variété" />
              </SelectTrigger>
              <SelectContent>
                {varieties.map((variety) => (
                  <SelectItem key={variety.id} value={variety.id}>
                    {variety.name} ({variety.category})
                  </SelectItem>
                ))}
                <SelectItem value="custom">Variété personnalisée</SelectItem>
              </SelectContent>
            </Select>
            
            {formData.variety_id === "custom" && (
              <Input
                value={formData.custom_variety}
                onChange={(e) => handleInputChange("custom_variety", e.target.value)}
                placeholder="Entrez votre variété personnalisée"
                required
              />
            )}
          </div>

          {/* Date de plantation */}
          <div className="space-y-2">
            <Label htmlFor="plantingDate">Date de plantation</Label>
            <div className="relative">
              <Input
                id="plantingDate"
                type="date"
                value={formData.planting_date}
                onChange={(e) => handleInputChange("planting_date", e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Prix d'achat */}
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Prix d'achat (€)</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              value={formData.purchase_price}
              onChange={(e) => handleInputChange("purchase_price", e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Localisation */}
          <div className="space-y-2">
            <Label htmlFor="location">Localisation</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="ex: Jardin principal, Serre..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleGetLocation}
                variant="outline"
                className="px-3"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Upload de photos */}
          <div className="space-y-2">
            <Label>Photos de la plante (max 5)</Label>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Cliquez pour ajouter des photos</p>
                </label>
              </div>

              {/* Aperçu des photos */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        onClick={() => removeFile(index)}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 bg-green-600 text-white px-1 text-xs rounded">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Ajoutez des notes sur cette plante..."
              className="min-h-[80px]"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Ajout en cours..." : "Ajouter la plante"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlantModal;
