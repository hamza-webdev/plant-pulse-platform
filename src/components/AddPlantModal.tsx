
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import PlantCategorySelector from "./PlantCategorySelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (plantData: any) => void;
}

const AddPlantModal = ({ isOpen, onClose, onAddPlant }: AddPlantModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    custom_variety: "",
    location: "",
    notes: "",
    planting_date: undefined as Date | undefined,
    categoryId: "",
    plantNameId: "",
    selectedPlantName: ""
  });

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toast } = useToast();

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const uploadPhoto = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('plant-photos')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading photo:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('plant-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let photoUrl = null;

      // Upload photo if selected
      if (selectedPhoto) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          photoUrl = await uploadPhoto(selectedPhoto, user.id);
          if (!photoUrl) {
            toast({
              title: "Erreur",
              description: "Impossible d'uploader la photo",
              variant: "destructive"
            });
            setUploading(false);
            return;
          }
        }
      }

      const plantData = {
        name: formData.selectedPlantName || formData.name,
        custom_variety: formData.custom_variety,
        location: formData.location,
        notes: formData.notes,
        planting_date: formData.planting_date ? format(formData.planting_date, 'yyyy-MM-dd') : null,
        status: 'healthy',
        photo_url: photoUrl
      };

      onAddPlant(plantData);
      
      // Reset form
      setFormData({
        name: "",
        custom_variety: "",
        location: "",
        notes: "",
        planting_date: undefined,
        categoryId: "",
        plantNameId: "",
        selectedPlantName: ""
      });
      setSelectedPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error adding plant:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la plante",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId,
      plantNameId: "",
      selectedPlantName: "",
      name: ""
    }));
  };

  const handlePlantNameChange = (plantNameId: string, plantName: string) => {
    setFormData(prev => ({
      ...prev,
      plantNameId,
      selectedPlantName: plantName,
      name: plantName
    }));
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value,
      selectedPlantName: ""
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle plante</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PlantCategorySelector
            selectedCategory={formData.categoryId}
            selectedPlantName={formData.plantNameId}
            onCategoryChange={handleCategoryChange}
            onPlantNameChange={handlePlantNameChange}
          />

          <div>
            <Label htmlFor="customName">Ou saisissez un nom personnalisé</Label>
            <Input
              id="customName"
              value={formData.name}
              onChange={handleCustomNameChange}
              placeholder="Nom de la plante"
            />
          </div>

          <div>
            <Label htmlFor="variety">Variété (optionnel)</Label>
            <Input
              id="variety"
              value={formData.custom_variety}
              onChange={(e) => setFormData(prev => ({ ...prev, custom_variety: e.target.value }))}
              placeholder="Ex: Tomate cerise, Rose rouge..."
            />
          </div>

          <div>
            <Label htmlFor="location">Emplacement</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ex: Jardin, Balcon, Serre..."
            />
          </div>

          <div>
            <Label>Date de plantation</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.planting_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.planting_date ? (
                    format(formData.planting_date, "PPP", { locale: undefined })
                  ) : (
                    "Sélectionner une date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.planting_date}
                  onSelect={(date) => {
                    setFormData(prev => ({ ...prev, planting_date: date }));
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="photo">Photo de la plante (optionnel)</Label>
            <div className="mt-2">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Aperçu de la photo"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={removePhoto}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer rounded-md bg-white font-medium text-green-600 hover:text-green-500"
                      >
                        <span>Choisir une photo</span>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handlePhotoSelect}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 10MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Ajoutez des notes sur votre plante..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.name || uploading}
            >
              {uploading ? "Ajout en cours..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlantModal;
