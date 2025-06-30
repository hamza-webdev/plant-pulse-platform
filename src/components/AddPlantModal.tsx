
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Camera, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (plantData: any) => void;
}

const AddPlantModal = ({ isOpen, onClose, onAddPlant }: AddPlantModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    variety: "",
    plantingDate: "",
    purchasePrice: "",
    location: "",
    notes: "",
    lastPhoto: "/placeholder.svg"
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.variety || !formData.plantingDate) {
      toast({
        title: "Champs requis manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    onAddPlant(formData);
    setFormData({
      name: "",
      variety: "",
      plantingDate: "",
      purchasePrice: "",
      location: "",
      notes: "",
      lastPhoto: "/placeholder.svg"
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleInputChange("location", `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast({
            title: "Position récupérée",
            description: "Votre position GPS a été ajoutée automatiquement.",
          });
        },
        (error) => {
          toast({
            title: "Erreur de géolocalisation",
            description: "Impossible de récupérer votre position. Veuillez saisir manuellement.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
        variant: "destructive"
      });
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
          {/* Plant Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nom de la plante *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="ex: Tomates, Basilic, Menthe..."
              className="w-full"
              required
            />
          </div>

          {/* Variety */}
          <div className="space-y-2">
            <Label htmlFor="variety" className="text-sm font-medium text-gray-700">
              Variété *
            </Label>
            <Input
              id="variety"
              value={formData.variety}
              onChange={(e) => handleInputChange("variety", e.target.value)}
              placeholder="ex: Cherry Roma, Genovese..."
              className="w-full"
              required
            />
          </div>

          {/* Planting Date */}
          <div className="space-y-2">
            <Label htmlFor="plantingDate" className="text-sm font-medium text-gray-700">
              Date de plantation *
            </Label>
            <div className="relative">
              <Input
                id="plantingDate"
                type="date"
                value={formData.plantingDate}
                onChange={(e) => handleInputChange("plantingDate", e.target.value)}
                className="w-full pl-10"
                required
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchasePrice" className="text-sm font-medium text-gray-700">
              Prix d'achat (optionnel)
            </Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Localisation
            </Label>
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

          {/* Photo Upload Placeholder */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Photo de la plante
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Ajoutez une photo de votre plante</p>
              <Button type="button" variant="outline" size="sm">
                Choisir une photo
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Ajoutez des notes sur cette plante..."
              className="w-full min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Ajouter la plante
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlantModal;
