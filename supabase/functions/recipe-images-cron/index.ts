
// This is a cron job that will run every day to fetch images for recipes that don't have images
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Define common fetch options with required headers
const fetchOptions = {
  method: "GET",
  headers: {
    Authorization: Deno.env.get("PEXELS_API_KEY") ?? "5G3aNU76uY1nJZjS3w9gRjZjUQ77GQceRSu6bj93ZYVm0kdzKWFxIc4e" // Use env var with fallback to provided key
  }
};

// Helper function to check if an image URL is valid
async function isValidImageUrl(url: string): Promise<boolean> {
  if (!url) return false;
  
  // Check for common invalid patterns
  if (
    url.includes('localhost') || 
    url.includes('127.0.0.1') || 
    url.trim() === '' ||
    url === 'undefined' ||
    url === 'null'
  ) {
    return false;
  }
  
  try {
    // Try to fetch the image header to see if it exists and is an image
    const response = await fetch(url, { 
      method: "HEAD",
      headers: { "Accept": "image/*" }
    });
    
    if (!response.ok) return false;
    
    // Check if content-type indicates an image
    const contentType = response.headers.get("content-type");
    return contentType ? contentType.startsWith("image/") : false;
  } catch (error) {
    // Any error during fetch means the image is not accessible
    return false;
  }
}

// Handle the request and run the cron job
Deno.serve(async (_req) => {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all recipes (no limit since we want to check all of them)
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("id, name, image_url");

    if (error) throw error;
    
    if (!recipes || recipes.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recipes found" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];
    const processedCount = { total: 0, replaced: 0, valid: 0, invalid: 0 };
    
    // Process each recipe
    for (const recipe of recipes) {
      try {
        processedCount.total++;
        const imageValid = recipe.image_url ? await isValidImageUrl(recipe.image_url) : false;
        
        // Only replace if the image_url is missing or invalid
        if (!imageValid) {
          processedCount.invalid++;
          const query = encodeURIComponent(recipe.name);
          const response = await fetch(
            `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
            fetchOptions
          );

          if (!response.ok) {
            results.push({
              recipeId: recipe.id,
              status: "error",
              error: `Pexels API error: ${response.statusText}`,
              oldUrl: recipe.image_url || "(none)"
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

            processedCount.replaced++;
            results.push({
              recipeId: recipe.id,
              status: updateError ? "error" : "success",
              oldUrl: recipe.image_url || "(none)",
              newUrl: imageUrl
            });
            
            if (updateError) {
              results[results.length - 1].error = updateError.message;
            }
          } else {
            results.push({
              recipeId: recipe.id,
              status: "no_image_found",
              oldUrl: recipe.image_url || "(none)"
            });
          }
        } else {
          // Image is valid, no need to replace
          processedCount.valid++;
        }
        
        // Wait a bit between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.push({
          recipeId: recipe.id,
          status: "error",
          error: error.message,
          oldUrl: recipe.image_url || "(none)"
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processedCount.total} recipes. Found ${processedCount.valid} valid images. Replaced ${processedCount.replaced} invalid images.`,
        summary: processedCount,
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
