
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Calendar, TrendingUp, Droplets, AlertTriangle } from "lucide-react";
import { useState } from "react";
import PlantDetailsModal from "./PlantDetailsModal";

interface Plant {
  id: string; // Changed from number to string to match UUID
  name: string;
  variety: string;
  plantingDate: string;
  location: string;
  lastPhoto: string;
  growth: number;
  status: "healthy" | "needs-water" | "attention";
}

interface PlantCardProps {
  plant: Plant;
}

const PlantCard = ({ plant }: PlantCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
          {/* Plant Image */}
          <div className="relative h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg overflow-hidden">
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

          {/* Growth Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Croissance</span>
              <span className="font-medium text-gray-900">{plant.growth}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${plant.growth}%` }}
              ></div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => setIsDetailsOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            Voir les détails
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

export default PlantCard;
