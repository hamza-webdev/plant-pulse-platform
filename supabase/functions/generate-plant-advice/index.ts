
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plantName, variety, plantingDate, location, status } = await req.json();

    // Calculer l'âge de la plante
    const planted = new Date(plantingDate);
    const today = new Date();
    const daysSincePlanted = Math.ceil((today.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));

    const prompt = `En tant qu'expert en jardinage, donne un conseil court et pratique (maximum 2 phrases) pour une plante ${plantName} de variété ${variety}, plantée il y a ${daysSincePlanted} jours, située en ${location}, avec un statut "${status}". Le conseil doit être spécifique à la saison actuelle et à l'âge de la plante.`;

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
            content: 'Tu es un expert en jardinage. Donne des conseils courts, pratiques et spécifiques. Réponds toujours en français.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const advice = data.choices[0].message.content;

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating plant advice:', error);
    return new Response(JSON.stringify({ error: 'Impossible de générer le conseil' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
