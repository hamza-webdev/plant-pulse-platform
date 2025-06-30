
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import PlantCategorySelector from "./PlantCategorySelector";

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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const plantData = {
      name: formData.selectedPlantName || formData.name,
      custom_variety: formData.custom_variety,
      location: formData.location,
      notes: formData.notes,
      planting_date: formData.planting_date ? format(formData.planting_date, 'yyyy-MM-dd') : null,
      status: 'healthy'
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
      <DialogContent className="sm:max-w-[425px]">
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
              disabled={!formData.name}
            >
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlantModal;
