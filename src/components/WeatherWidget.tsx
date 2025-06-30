
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, Cloud, Sun, CloudRain, AlertTriangle } from "lucide-react";

interface WeatherWidgetProps {
  userCity?: string;
  userCountry?: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  location: string;
  alerts: string[];
}

interface ForecastData {
  day: string;
  temp: number;
  humidity: number;
  condition: string;
  alert?: boolean;
}

const WeatherWidget = ({ userCity, userCountry }: WeatherWidgetProps) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = "5edade35f3f859474f7beb2931ff9dcd";
  const location = userCity && userCountry 
    ? `${userCity}, ${userCountry}` 
    : "Tunis, Tunisie";

  useEffect(() => {
    fetchWeatherData();
  }, [userCity, userCountry]);

  const getCoordinates = async (cityName: string, countryName: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryName}&limit=1&appid=${API_KEY}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon };
      }
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Utiliser les coordonnées de la ville de l'utilisateur ou Tunis par défaut
      let coordinates;
      if (userCity && userCountry) {
        coordinates = await getCoordinates(userCity, userCountry);
      }
      
      // Coordonnées par défaut pour Tunis si pas de ville utilisateur ou erreur
      if (!coordinates) {
        coordinates = { lat: 36.8065, lon: 10.1815 }; // Tunis
      }

      // Récupérer la météo actuelle
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${API_KEY}&units=metric&lang=fr`
      );
      const currentData = await currentResponse.json();

      // Récupérer les prévisions 5 jours
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${API_KEY}&units=metric&lang=fr`
      );
      const forecastData = await forecastResponse.json();

      if (currentData && forecastData) {
        // Traiter les données météo actuelles
        const weatherCondition = getWeatherCondition(currentData.weather[0].main);
        const alerts = [];
        
        // Vérifier s'il y a des alertes de température élevée
        if (currentData.main.temp > 35) {
          alerts.push(`Forte chaleur à ${location} (${Math.round(currentData.main.temp)}°C)`);
        }

        setCurrentWeather({
          temperature: Math.round(currentData.main.temp),
          humidity: currentData.main.humidity,
          condition: weatherCondition,
          location: location,
          alerts: alerts
        });

        // Traiter les prévisions (prendre un élément par jour)
        const dailyForecasts: ForecastData[] = [];
        const processedDays = new Set();
        
        forecastData.list.forEach((item: any, index: number) => {
          const date = new Date(item.dt * 1000);
          const dayKey = date.toDateString();
          
          if (!processedDays.has(dayKey) && dailyForecasts.length < 4) {
            processedDays.add(dayKey);
            
            let dayName;
            if (index === 0) {
              dayName = "Aujourd'hui";
            } else if (index <= 8) {
              dayName = "Demain";
            } else {
              dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
            }

            const temp = Math.round(item.main.temp);
            const alert = temp > 35;

            dailyForecasts.push({
              day: dayName,
              temp: temp,
              humidity: item.main.humidity,
              condition: getWeatherCondition(item.weather[0].main),
              alert: alert
            });
          }
        });

        setForecast(dailyForecasts);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Impossible de charger les données météo');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherCondition = (main: string): string => {
    switch (main.toLowerCase()) {
      case 'clear':
        return 'sunny';
      case 'clouds':
        return 'partly-cloudy';
      case 'rain':
      case 'drizzle':
        return 'rainy';
      case 'snow':
        return 'cloudy';
      default:
        return 'partly-cloudy';
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Chargement de la météo...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWeather) {
    return null;
  }

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
