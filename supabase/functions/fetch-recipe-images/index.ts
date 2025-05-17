
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipeId, recipeTitle } = await req.json();

    if (!recipeId || !recipeTitle) {
      return new Response(
        JSON.stringify({ error: "Recipe ID and title are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if recipe already has an image URL
    const { data: recipeData } = await supabase
      .from("recipes")
      .select("image_url")
      .eq("id", recipeId)
      .single();

    if (recipeData?.image_url) {
      return new Response(
        JSON.stringify({ imageUrl: recipeData.image_url, fromCache: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Encode the recipe title for the URL
    const query = encodeURIComponent(recipeTitle);
    
    // Fetch image from Pexels API
    const pexelsApiKey = Deno.env.get("PEXELS_API_KEY") ?? "";
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
      {
        headers: {
          Authorization: pexelsApiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    let imageUrl = "";

    // Extract image URL from Pexels response
    if (data.photos && data.photos.length > 0) {
      imageUrl = data.photos[0].src.medium;
      
      // Update recipe with the new image URL
      const { error } = await supabase
        .from("recipes")
        .update({ image_url: imageUrl })
        .eq("id", recipeId);

      if (error) {
        throw new Error(`Error updating recipe: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({ imageUrl, fromCache: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
