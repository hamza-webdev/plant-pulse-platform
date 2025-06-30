
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Calendar, TrendingUp, Droplets, AlertTriangle, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import PlantDetailsModal from "./PlantDetailsModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plant {
  id: string;
  name: string;
  variety: string;
  plantingDate: string;
  location: string;
  lastPhoto: string;
  growth: number;
  status: "healthy" | "needs-water" | "attention";
}

interface EnhancedPlantCardProps {
  plant: Plant;
}

const EnhancedPlantCard = ({ plant }: EnhancedPlantCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [plantAdvice, setPlantAdvice] = useState<string>("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "needs-water":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "attention":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <TrendingUp className="w-3 h-3" />;
      case "needs-water":
        return <Droplets className="w-3 h-3" />;
      case "attention":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "En bonne santé";
      case "needs-water":
        return "Besoin d'eau";
      case "attention":
        return "Attention requise";
      default:
        return "Statut inconnu";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
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

  // Calculer la progression intelligente basée sur les jours et mesures
  const calculateSmartProgress = () => {
    const daysOld = getDaysOld(plant.plantingDate);
    
    // Base progression sur les jours (croissance typique sur 120 jours)
    const baseProgress = Math.min((daysOld / 120) * 100, 100);
    
    // Ajuster selon le statut
    let statusMultiplier = 1;
    if (plant.status === "healthy") statusMultiplier = 1.1;
    else if (plant.status === "needs-water") statusMultiplier = 0.8;
    else if (plant.status === "attention") statusMultiplier = 0.6;
    
    // Prendre en compte la croissance existante si elle est définie
    const finalProgress = plant.growth > 0 
      ? Math.max(plant.growth, baseProgress * statusMultiplier)
      : baseProgress * statusMultiplier;
    
    return Math.min(Math.round(finalProgress), 100);
  };

  const generatePlantAdvice = async () => {
    if (plantAdvice || isLoadingAdvice) return;
    
    setIsLoadingAdvice(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-plant-advice', {
        body: {
          plantName: plant.name,
          variety: plant.variety,
          plantingDate: plant.plantingDate,
          location: plant.location,
          status: plant.status
        }
      });

      if (error) {
        console.error('Error generating advice:', error);
        setPlantAdvice("Conseil non disponible pour le moment.");
      } else {
        setPlantAdvice(data.advice);
      }
    } catch (error) {
      console.error('Error:', error);
      setPlantAdvice("Conseil non disponible pour le moment.");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  useEffect(() => {
    // Générer le conseil automatiquement au chargement
    generatePlantAdvice();
  }, [plant.id]);

  const smartProgress = calculateSmartProgress();

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{plant.name}</h3>
              <p className="text-sm text-gray-600">{plant.variety}</p>
            </div>
            <Badge className={`${getStatusColor(plant.status)} flex items-center gap-1`}>
              {getStatusIcon(plant.status)}
              <span className="text-xs">{getStatusText(plant.status)}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Plant Image - Clickable */}
          <div 
            className="relative h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setIsDetailsOpen(true)}
          >
            <img
              src={plant.lastPhoto}
              alt={plant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <span className="text-white font-medium opacity-0 hover:opacity-100 transition-opacity">
                Voir détails
              </span>
            </div>
          </div>

          {/* Plant Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Planté le {formatDate(plant.plantingDate)} • {getDaysOld(plant.plantingDate)} jours</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{plant.location}</span>
            </div>
          </div>

          {/* Smart Growth Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progression intelligente</span>
              <span className="font-medium text-gray-900">{smartProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${smartProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              Basée sur l'âge ({getDaysOld(plant.plantingDate)} jours) et l'état de santé
            </p>
          </div>

          {/* AI Plant Advice */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-800 mb-1">Conseil IA</p>
                {isLoadingAdvice ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {plantAdvice || "Conseil en cours de génération..."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => setIsDetailsOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            Voir les détails complets
          </Button>
        </CardContent>
      </Card>

      <PlantDetailsModal
        plant={plant}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};

export default EnhancedPlantCard;
