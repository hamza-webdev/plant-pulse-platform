
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, Cloud, Sun, CloudRain, AlertTriangle } from "lucide-react";

interface WeatherWidgetProps {
  userCity?: string;
  userCountry?: string;
}

const WeatherWidget = ({ userCity, userCountry }: WeatherWidgetProps) => {
  // Utiliser la ville de l'utilisateur ou une valeur par défaut
  const location = userCity && userCountry 
    ? `${userCity}, ${userCountry}` 
    : "Tunis, Tunisie";

  // Mock weather data - in a real app, this would come from OpenWeatherMap API
  // Les données seraient récupérées en fonction de la localisation de l'utilisateur
  const currentWeather = {
    temperature: 24,
    humidity: 65,
    condition: "partly-cloudy",
    location: location,
    alerts: userCity ? [`Forte chaleur prévue demain à ${userCity} (+35°C)`] : ["Forte chaleur prévue demain (+35°C)"]
  };

  const forecast = [
    { day: "Aujourd'hui", temp: 24, humidity: 65, condition: "partly-cloudy" },
    { day: "Demain", temp: 35, humidity: 45, condition: "sunny", alert: true },
    { day: "Après-demain", temp: 28, humidity: 60, condition: "cloudy" },
    { day: "Vendredi", temp: 22, humidity: 75, condition: "rainy" }
  ];

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case "partly-cloudy":
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case "cloudy":
        return <Cloud className="w-6 h-6 text-gray-600" />;
      case "rainy":
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "sunny":
        return "Ensoleillé";
      case "partly-cloudy":
        return "Partiellement nuageux";
      case "cloudy":
        return "Nuageux";
      case "rainy":
        return "Pluvieux";
      default:
        return "Ensoleillé";
    }
  };

  return (
    <div className="space-y-4">
      {/* Weather Alerts */}
      {currentWeather.alerts.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800 mb-1">Alerte Météo</h4>
                {currentWeather.alerts.map((alert, index) => (
                  <p key={index} className="text-sm text-orange-700">{alert}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Weather */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Météo Actuelle
          </CardTitle>
          <p className="text-sm text-gray-600">{currentWeather.location}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <Thermometer className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{currentWeather.temperature}°C</p>
              <p className="text-xs text-gray-600">Température</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-full mx-auto mb-2">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{currentWeather.humidity}%</p>
              <p className="text-xs text-gray-600">Humidité</p>
            </div>

            <div className="text-center col-span-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2">
                {getWeatherIcon(currentWeather.condition)}
              </div>
              <p className="text-lg font-medium text-gray-900">{getConditionText(currentWeather.condition)}</p>
              <p className="text-xs text-gray-600">Conditions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Forecast */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">Prévisions 4 jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg relative">
                {day.alert && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-100 text-orange-800 text-xs px-1 py-0">
                    !
                  </Badge>
                )}
                <p className="text-sm font-medium text-gray-900 mb-2">{day.day}</p>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(day.condition)}
                </div>
                <p className="text-lg font-bold text-gray-900">{day.temp}°C</p>
                <p className="text-xs text-gray-600">{day.humidity}% humid.</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherWidget;
