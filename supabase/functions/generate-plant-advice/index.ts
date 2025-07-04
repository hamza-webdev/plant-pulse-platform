
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'Configuration manquante. Veuillez contacter l\'administrateur.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { plantName, variety, plantingDate, location, status, measurements, temperature } = await req.json();

    console.log('Received plant data:', { plantName, variety, plantingDate, location, status, measurements, temperature });

    // Calculer l'âge de la plante
    const planted = new Date(plantingDate);
    const today = new Date();
    const daysSincePlanted = Math.ceil((today.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));

    // Préparer les informations de mesures
    let measurementInfo = "Aucune mesure disponible";
    if (measurements && measurements.length > 0) {
      const latestMeasurement = measurements[0]; // La plus récente
      const parts = [];
      if (latestMeasurement.height) parts.push(`hauteur: ${latestMeasurement.height}cm`);
      if (latestMeasurement.width) parts.push(`largeur: ${latestMeasurement.width}cm`);
      measurementInfo = parts.length > 0 ? parts.join(', ') : "Mesures non spécifiées";
    }

    // Préparer l'information de température
    const tempInfo = temperature ? `${temperature}°C` : "température inconnue";

    const prompt = `En tant qu'expert en jardinage, analyse cette plante et donne un diagnostic complet :

Informations de la plante :
- Nom : ${plantName}
- Variété/Catégorie : ${variety}
- Âge : ${daysSincePlanted} jours (plantée le ${new Date(plantingDate).toLocaleDateString('fr-FR')})
- Localisation : ${location}
- Statut actuel : ${status}
- Mesures actuelles : ${measurementInfo}
- Température ambiante : ${tempInfo}

Donne-moi un diagnostic en 2-3 phrases qui inclut :
1. L'état général de la plante basé sur son âge et ses mesures
2. Des conseils spécifiques selon la température et la saison
3. Des recommandations d'arrosage et de soins

Réponds en français de manière claire et pratique.`;

    console.log('Sending prompt to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en jardinage avec 20 ans d\'expérience. Donne des conseils précis, pratiques et adaptés à chaque situation. Utilise un ton bienveillant et professionnel. Réponds toujours en français en 2-3 phrases maximum.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    const advice = data.choices[0].message.content;

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating plant advice:', error);
    return new Response(JSON.stringify({ 
      error: 'Impossible de générer le conseil pour le moment. Veuillez réessayer.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
