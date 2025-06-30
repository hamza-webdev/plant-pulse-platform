import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User as UserIcon, LogOut, Settings, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { User, Session } from '@supabase/supabase-js';
import PlantCard from "@/components/PlantCard";
import AddPlantModal from "@/components/AddPlantModal";
import ProfileModal from "@/components/ProfileModal";
import WeatherWidget from "@/components/WeatherWidget";

interface Plant {
  id: number;
  name: string;
  variety: string;
  plantingDate: string;
  location: string;
  lastPhoto: string;
  growth: number;
  status: "healthy" | "needs-water" | "attention";
}

interface UserProfile {
  full_name: string;
  address: string;
  city?: string;
  country?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Configurer l'écoute des changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchPlants();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('plante_profile')
        .select('full_name, address')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        // Extraire la ville et le pays de l'adresse
        const address = data.address || '';
        let city = '';
        let country = '';
        
        if (address) {
          // Essayer de parser l'adresse pour extraire ville et pays
          const parts = address.split(',').map(part => part.trim());
          if (parts.length >= 2) {
            // Prendre les deux derniers éléments comme ville et pays
            country = parts[parts.length - 1];
            city = parts[parts.length - 2];
          } else if (parts.length === 1) {
            city = parts[0];
          }
        }
        
        setUserProfile({
          full_name: data.full_name || '',
          address: data.address || '',
          city,
          country
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select(`
          *,
          plant_varieties(name),
          plant_photos(photo_url, is_primary)
        `)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching plants:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos plantes",
          variant: "destructive"
        });
      } else {
        const plantsWithPhotos = data?.map(plant => {
          // Properly map the status to the union type
          let mappedStatus: "healthy" | "needs-water" | "attention" = "healthy";
          if (plant.status === "needs-water") {
            mappedStatus = "needs-water";
          } else if (plant.status === "attention") {
            mappedStatus = "attention";
          }

          return {
            id: parseInt(plant.id),
            name: plant.name,
            variety: plant.plant_varieties?.name || plant.custom_variety || 'Variété inconnue',
            plantingDate: plant.planting_date || new Date().toISOString().split('T')[0],
            location: plant.location || 'Non spécifié',
            lastPhoto: plant.plant_photos?.find(p => p.is_primary)?.photo_url || '/placeholder.svg',
            growth: plant.growth || 0,
            status: mappedStatus
          };
        }) || [];
        setPlants(plantsWithPhotos);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/auth");
    }
  };

  const handleAddPlant = async (plantData: any) => {
    try {
      const { data: newPlant, error } = await supabase
        .from('plants')
        .insert([{
          ...plantData,
          user_id: user?.id
        }])
        .select('*')
        .single();

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la plante",
          variant: "destructive"
        });
      } else {
        await fetchPlants(); // Recharger la liste
        setIsAddPlantOpen(false);
        toast({
          title: "Plante ajoutée avec succès !",
          description: `${plantData.name} a été ajouté à votre jardin.`,
        });
      }
    } catch (error) {
      console.error('Error adding plant:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">🌱</span>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* En-tête mobile */}
      <header className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌱</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nabtati</h1>
                <div className="flex items-center space-x-1">
                  <p className="text-xs text-gray-600">Tableau de bord</p>
                  {userProfile?.city && userProfile?.country && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-600">
                          {userProfile.city}, {userProfile.country}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProfileOpen(true)}
                className="p-2"
              >
                <UserIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Section Météo */}
        <WeatherWidget userCity={userProfile?.city} userCountry={userProfile?.country} />

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{plants.length}</p>
              <p className="text-sm text-gray-600">Plantes</p>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">24°C</p>
              <p className="text-sm text-gray-600">Température</p>
            </CardContent>
          </Card>
        </div>

        {/* Bouton Ajouter Plante */}
        <Button
          onClick={() => setIsAddPlantOpen(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une plante
        </Button>

        {/* Section Plantes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mes Plantes</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {plants.length} actives
            </Badge>
          </div>

          {plants.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-dashed border-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune plante</h3>
                <p className="text-gray-600 mb-4">Commencez à suivre vos plantes</p>
                <Button
                  onClick={() => setIsAddPlantOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ma première plante
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPlantModal
        isOpen={isAddPlantOpen}
        onClose={() => setIsAddPlantOpen(false)}
        onAddPlant={handleAddPlant}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          // Recharger le profil après fermeture du modal
          if (user) {
            fetchUserProfile();
          }
        }}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
