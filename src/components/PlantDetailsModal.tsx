
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Droplets, Ruler, Calendar, TrendingUp, MapPin, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface WateringRecord {
  id: string;
  amount: number;
  notes: string;
  watering_date: string;
}

interface MeasurementRecord {
  id: string;
  height: number;
  width: number;
  notes: string;
  measurement_date: string;
}

interface PhotoRecord {
  id: string;
  photo_url: string;
  description: string;
  created_at: string;
}

const PlantDetailsModal = ({ plant, isOpen, onClose }: PlantDetailsModalProps) => {
  const [measurements, setMeasurements] = useState({
    height: "",
    width: "",
    notes: ""
  });

  const [watering, setWatering] = useState({
    amount: "",
    notes: ""
  });

  const [wateringHistory, setWateringHistory] = useState<WateringRecord[]>([]);
  const [measurementHistory, setMeasurementHistory] = useState<MeasurementRecord[]>([]);
  const [photoHistory, setPhotoHistory] = useState<PhotoRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchWateringHistory();
      fetchMeasurementHistory();
      fetchPhotoHistory();
    }
  }, [isOpen, plant.id]);

  const fetchWateringHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('plant_watering')
        .select('*')
        .eq('plant_id', plant.id)
        .order('watering_date', { ascending: false });

      if (error) {
        console.error('Error fetching watering history:', error);
      } else {
        setWateringHistory(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMeasurementHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('plant_measurements')
        .select('*')
        .eq('plant_id', plant.id)
        .order('measurement_date', { ascending: false });

      if (error) {
        console.error('Error fetching measurement history:', error);
      } else {
        setMeasurementHistory(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPhotoHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('plant_photos')
        .select('*')
        .eq('plant_id', plant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching photo history:', error);
      } else {
        setPhotoHistory(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMeasurementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!measurements.height && !measurements.width) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer au moins une mesure.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('plant_measurements')
        .insert([{
          plant_id: plant.id,
          height: measurements.height ? parseInt(measurements.height) : null,
          width: measurements.width ? parseInt(measurements.width) : null,
          notes: measurements.notes || null
        }]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer la mesure.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Mesures enregistrées",
          description: `Nouvelles mesures ajoutées pour ${plant.name}.`,
        });
        setMeasurements({ height: "", width: "", notes: "" });
        fetchMeasurementHistory();
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
    }
  };

  const handleWateringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!watering.amount) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer la quantité d'eau.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('plant_watering')
        .insert([{
          plant_id: plant.id,
          amount: parseInt(watering.amount),
          notes: watering.notes || null
        }]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer l'arrosage.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Arrosage enregistré",
          description: `Arrosage de ${plant.name} enregistré avec succès.`,
        });
        setWatering({ amount: "", notes: "" });
        fetchWateringHistory();
      }
    } catch (error) {
      console.error('Error saving watering:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour uploader une photo.",
          variant: "destructive"
        });
        return;
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${plant.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('plant-photos')
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({
          title: "Erreur",
          description: "Impossible d'uploader la photo.",
          variant: "destructive"
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('plant-photos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('plant_photos')
        .insert([{
          plant_id: plant.id,
          photo_url: publicUrl,
          description: `Photo du ${new Date().toLocaleDateString('fr-FR')}`
        }]);

      if (dbError) {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer la photo en base.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Photo ajoutée",
          description: "La photo a été ajoutée avec succès.",
        });
        setSelectedFile(null);
        fetchPhotoHistory();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
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
                  {measurementHistory.length > 0 && (
                    <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dernière mesure</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(measurementHistory[0].measurement_date)} - 
                          {measurementHistory[0].height && ` Hauteur: ${measurementHistory[0].height}cm`}
                          {measurementHistory[0].width && ` Largeur: ${measurementHistory[0].width}cm`}
                        </p>
                      </div>
                    </div>
                  )}
                  {wateringHistory.length > 0 && (
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dernier arrosage</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(wateringHistory[0].watering_date)} - {wateringHistory[0].amount}ml
                        </p>
                      </div>
                    </div>
                  )}
                  {photoHistory.length > 0 && (
                    <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                      <Camera className="w-4 h-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dernière photo</p>
                        <p className="text-xs text-gray-600">{formatDate(photoHistory[0].created_at)}</p>
                      </div>
                    </div>
                  )}
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
                  {measurementHistory.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucune mesure enregistrée</p>
                  ) : (
                    measurementHistory.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{formatDate(record.measurement_date)}</p>
                          <p className="text-xs text-gray-600">{record.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {record.height && `${record.height}cm`}
                            {record.height && record.width && ' × '}
                            {record.width && `${record.width}cm`}
                          </p>
                          <p className="text-xs text-gray-600">H × L</p>
                        </div>
                      </div>
                    ))
                  )}
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
                      required
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
                  {wateringHistory.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucun arrosage enregistré</p>
                  ) : (
                    wateringHistory.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{formatDate(record.watering_date)}</p>
                          <p className="text-xs text-gray-600">{record.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{record.amount}ml</p>
                          <p className="text-xs text-gray-600">Quantité</p>
                        </div>
                      </div>
                    ))
                  )}
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
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Ajoutez une nouvelle photo de votre plante</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Choisir une photo</span>
                      </Button>
                    </Label>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">{selectedFile.name}</span>
                      <Button 
                        onClick={handlePhotoUpload} 
                        disabled={isUploading}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isUploading ? (
                          <>
                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                            Upload...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Uploader
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photo History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Galerie photos</CardTitle>
              </CardHeader>
              <CardContent>
                {photoHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">Aucune photo enregistrée</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photoHistory.map((photo) => (
                      <div key={photo.id} className="space-y-2">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={photo.photo_url}
                            alt={photo.description || `Photo du ${formatDate(photo.created_at)}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium">{formatDate(photo.created_at)}</p>
                          <p className="text-xs text-gray-600">{photo.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
