
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Thermometer, Cloud, Droplets, Camera, MapPin, TrendingUp } from "lucide-react";
import PlantCard from "@/components/PlantCard";
import WeatherWidget from "@/components/WeatherWidget";
import AddPlantModal from "@/components/AddPlantModal";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [plants, setPlants] = useState([
    {
      id: 1,
      name: "Tomates Cerises",
      variety: "Cherry Roma",
      plantingDate: "2024-03-15",
      location: "Jardin Principal",
      lastPhoto: "/placeholder.svg",
      growth: 25,
      status: "healthy"
    },
    {
      id: 2,
      name: "Basilic",
      variety: "Genovese",
      plantingDate: "2024-04-01",
      location: "Serre",
      lastPhoto: "/placeholder.svg",
      growth: 15,
      status: "needs-water"
    }
  ]);

  const { toast } = useToast();

  const handleAddPlant = (plantData: any) => {
    const newPlant = {
      id: plants.length + 1,
      ...plantData,
      growth: 0,
      status: "healthy"
    };
    setPlants([...plants, newPlant]);
    setIsAddPlantOpen(false);
    toast({
      title: "Plante ajoutée avec succès!",
      description: `${plantData.name} a été ajouté à votre jardin.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nabtati</h1>
                <p className="text-sm text-gray-600">Votre assistant agricole</p>
              </div>
            </div>
            <Button
              onClick={() => setIsAddPlantOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une plante
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Weather Section */}
        <div className="mb-8">
          <WeatherWidget />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{plants.length}</p>
              <p className="text-sm text-gray-600">Plantes suivies</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <Thermometer className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">24°C</p>
              <p className="text-sm text-gray-600">Température</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-cyan-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-full mx-auto mb-2">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">65%</p>
              <p className="text-sm text-gray-600">Humidité</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                <Camera className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Photos cette semaine</p>
            </CardContent>
          </Card>
        </div>

        {/* Plants Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mes Plantes</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {plants.length} plantes actives
            </Badge>
          </div>

          {plants.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-dashed border-2 border-gray-300">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune plante ajoutée</h3>
                <p className="text-gray-600 mb-4">Commencez à suivre vos plantes en ajoutant votre première culture.</p>
                <Button
                  onClick={() => setIsAddPlantOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter ma première plante
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Photo ajoutée - Tomates Cerises</p>
                  <p className="text-xs text-gray-600">Il y a 2 heures</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Arrosage effectué - Basilic</p>
                  <p className="text-xs text-gray-600">Hier à 18:30</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouvelle plante ajoutée - Jardin Principal</p>
                  <p className="text-xs text-gray-600">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddPlantModal
        isOpen={isAddPlantOpen}
        onClose={() => setIsAddPlantOpen(false)}
        onAddPlant={handleAddPlant}
      />
    </div>
  );
};

export default Index;
