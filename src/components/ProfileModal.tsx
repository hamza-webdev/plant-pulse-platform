
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, User as UserIcon, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from '@supabase/supabase-js';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
  avatar_url: string;
}

const ProfileModal = ({ isOpen, onClose, user }: ProfileModalProps) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
    avatar_url: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile();
    }
  }, [user, isOpen]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('plante_profile')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfileData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          avatar_url: data.avatar_url || ""
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setProfileData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
          setLoading(false);
          toast({
            title: "Position récupérée",
            description: "Vos coordonnées GPS ont été mises à jour",
          });
        },
        (error) => {
          setLoading(false);
          toast({
            title: "Erreur de géolocalisation",
            description: "Impossible de récupérer votre position",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        user_id: user?.id,
        full_name: profileData.full_name,
        phone: profileData.phone,
        address: profileData.address,
        latitude: profileData.latitude ? parseFloat(profileData.latitude) : null,
        longitude: profileData.longitude ? parseFloat(profileData.longitude) : null,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('plante_profile')
        .upsert(updateData);

      if (error) {
        console.error('Profile update error:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder le profil",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été sauvegardées",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Mon Profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              {profileData.avatar_url ? (
                <img 
                  src={profileData.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-green-600" />
              )}
            </div>
            <Button type="button" variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Changer la photo
            </Button>
          </div>

          {/* Nom complet */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <div className="relative">
              <Input
                id="fullName"
                value={profileData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Votre nom complet"
                className="pl-10"
              />
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Email (lecture seule) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="pl-10 bg-gray-50"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="pl-10"
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={profileData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Votre adresse complète"
            />
          </div>

          {/* Coordonnées GPS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Coordonnées GPS</Label>
              <Button
                type="button"
                onClick={handleGetLocation}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {loading ? "Localisation..." : "Ma position"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={profileData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="0.000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={profileData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="0.000000"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
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
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
