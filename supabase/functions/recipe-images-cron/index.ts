
// This is a cron job that will run every day to fetch images for recipes that don't have images
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Define common fetch options with required headers
const fetchOptions = {
  method: "GET",
  headers: {
    Authorization: Deno.env.get("PEXELS_API_KEY") ?? "5G3aNU76uY1nJZjS3w9gRjZjUQ77GQceRSu6bj93ZYVm0kdzKWFxIc4e" // Use env var with fallback to provided key
  }
};

// Handle the request and run the cron job
Deno.serve(async (_req) => {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recipes without images (limit to 10 per run to avoid rate limiting)
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("id, name")
      .is("image_url", null)
      .limit(10);

    if (error) throw error;
    
    if (!recipes || recipes.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recipes need images" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];
    
    // Process each recipe
    for (const recipe of recipes) {
      try {
        const query = encodeURIComponent(recipe.name);
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
          fetchOptions
        );

        if (!response.ok) {
          results.push({
            recipeId: recipe.id,
            status: "error",
            error: `Pexels API error: ${response.statusText}`
          });
          continue;
        }

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          const imageUrl = data.photos[0].src.medium;
          
          // Update the recipe with the image URL
          const { error: updateError } = await supabase
            .from("recipes")
            .update({ image_url: imageUrl })
            .eq("id", recipe.id);

          results.push({
            recipeId: recipe.id,
            status: updateError ? "error" : "success",
            imageUrl: imageUrl
          });
          
          if (updateError) {
            results[results.length - 1].error = updateError.message;
          }
        } else {
          results.push({
            recipeId: recipe.id,
            status: "no_image_found"
          });
        }
        
        // Wait a bit between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.push({
          recipeId: recipe.id,
          status: "error",
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${recipes.length} recipes`,
        results
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
