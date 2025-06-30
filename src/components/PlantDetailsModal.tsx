
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Droplets, Ruler, Calendar, TrendingUp, MapPin, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Plant {
  id: number;
  name: string;
  variety: string;
  plantingDate: string;
  location: string;
  lastPhoto: string;
  growth: number;
  status: string;
}

interface PlantDetailsModalProps {
  plant: Plant;
  isOpen: boolean;
  onClose: () => void;
}

const PlantDetailsModal = ({ plant, isOpen, onClose }: PlantDetailsModalProps) => {
  const [measurements, setMeasurements] = useState({
    height: "",
    width: "",
    notes: ""
  });

  const [watering, setWatering] = useState({
    amount: "",
    frequency: "daily",
    notes: ""
  });

  const { toast } = useToast();

  const handleMeasurementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mesures enregistrées",
      description: `Nouvelles mesures ajoutées pour ${plant.name}.`,
    });
    setMeasurements({ height: "", width: "", notes: "" });
  };

  const handleWateringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Arrosage enregistré",
      description: `Arrosage de ${plant.name} enregistré avec succès.`,
    });
    setWatering({ amount: "", frequency: "daily", notes: "" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDaysOld = (plantingDate: string) => {
    const today = new Date();
    const planted = new Date(plantingDate);
    const diffTime = Math.abs(today.getTime() - planted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Mock data for plant history
  const growthHistory = [
    { date: "2024-06-20", height: 15, width: 8, notes: "Première mesure" },
    { date: "2024-06-13", height: 12, width: 6, notes: "Croissance normale" },
    { date: "2024-06-06", height: 8, width: 4, notes: "Début de croissance" }
  ];

  const wateringHistory = [
    { date: "2024-06-25", amount: 500, notes: "Arrosage du matin" },
    { date: "2024-06-23", amount: 750, notes: "Jour de forte chaleur" },
    { date: "2024-06-21", amount: 500, notes: "Arrosage régulier" }
  ];

  const photoHistory = [
    { date: "2024-06-25", url: "/placeholder.svg", notes: "Photo hebdomadaire" },
    { date: "2024-06-18", url: "/placeholder.svg", notes: "Croissance visible" },
    { date: "2024-06-11", url: "/placeholder.svg", notes: "Première photo" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span>{plant.name}</span>
            <Badge variant="secondary" className="text-xs">
              {plant.variety}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="measurements">Mesures</TabsTrigger>
            <TabsTrigger value="watering">Arrosage</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Plant Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Informations de la plante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date de plantation</p>
                    <p className="font-medium">{formatDate(plant.plantingDate)}</p>
                    <p className="text-xs text-gray-500">{getDaysOld(plant.plantingDate)} jours</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Localisation</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {plant.location}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Progression de croissance</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      style={{ width: `${plant.growth}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{plant.growth}% de croissance estimée</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dernière mesure</p>
                      <p className="text-xs text-gray-600">Il y a 2 jours - Hauteur: 15cm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dernier arrosage</p>
                      <p className="text-xs text-gray-600">Hier - 500ml</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                    <Camera className="w-4 h-4 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dernière photo</p>
                      <p className="text-xs text-gray-600">Il y a 3 jours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4">
            {/* Add Measurement Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-blue-600" />
                  Ajouter une mesure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMeasurementSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Hauteur (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={measurements.height}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="width">Largeur (cm)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={measurements.width}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, width: e.target.value }))}
                        placeholder="8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="measurementNotes">Notes</Label>
                    <Input
                      id="measurementNotes"
                      value={measurements.notes}
                      onChange={(e) => setMeasurements(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observations sur la croissance..."
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Enregistrer la mesure
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Measurement History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des mesures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {growthHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{formatDate(record.date)}</p>
                        <p className="text-xs text-gray-600">{record.notes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{record.height}cm × {record.width}cm</p>
                        <p className="text-xs text-gray-600">H × L</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watering" className="space-y-4">
            {/* Add Watering Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                  Enregistrer un arrosage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWateringSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Quantité (ml)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={watering.amount}
                      onChange={(e) => setWatering(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wateringNotes">Notes</Label>
                    <Input
                      id="wateringNotes"
                      value={watering.notes}
                      onChange={(e) => setWatering(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Conditions d'arrosage..."
                    />
                  </div>
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Enregistrer l'arrosage
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Watering History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique d'arrosage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wateringHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{formatDate(record.date)}</p>
                        <p className="text-xs text-gray-600">{record.notes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{record.amount}ml</p>
                        <p className="text-xs text-gray-600">Quantité</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            {/* Add Photo Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-orange-600" />
                  Ajouter une photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Ajoutez une nouvelle photo de votre plante</p>
                  <Button variant="outline" size="sm">
                    Choisir une photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Photo History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Galerie photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoHistory.map((photo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={photo.url}
                          alt={`Photo du ${photo.date}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{formatDate(photo.date)}</p>
                        <p className="text-xs text-gray-600">{photo.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlantDetailsModal;
