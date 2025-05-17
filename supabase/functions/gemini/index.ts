
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as xhr from "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = 'AIzaSyDrqH77I3JurytTrR9sSfeanfGN39mCQy4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { prompt, recipeMode, availableIngredients, missingIngredients, generateMultipleRecipes } = body;
    
    let finalPrompt = prompt;
    
    // Format a special prompt for recipe recommendations if in recipe mode
    if (recipeMode === true) {
      // Build a structured prompt for recipe generation
      if (generateMultipleRecipes) {
        // Generate multiple recipe options
        finalPrompt = `Based on the following ingredients, generate 3 different recipe options ranked by how well they match the available ingredients:\n\n`;
      } else {
        // Generate a single recipe
        finalPrompt = `Generate a recipe based on the following ingredients:\n\n`;
      }
      
      if (availableIngredients && availableIngredients.length > 0) {
        finalPrompt += `Available Ingredients:\n${availableIngredients.join('\n')}\n\n`;
      }
      
      if (missingIngredients && missingIngredients.length > 0) {
        finalPrompt += `Missing Ingredients (suggest alternatives if possible):\n${missingIngredients.join('\n')}\n\n`;
      }
      
      if (generateMultipleRecipes) {
        finalPrompt += `Please provide three recipes in the following format:

RECIPE OPTION 1:
Recipe Name:
Match Score: (Give a percentage indicating how well this recipe matches the available ingredients)
Ingredients:
- Available: (List the ingredients this recipe uses that the user already has)
- Missing: (List the ingredients this recipe needs that the user doesn't have)
Instructions:
Cooking Time:
Difficulty:

RECIPE OPTION 2:
(Follow the same format)

RECIPE OPTION 3:
(Follow the same format)`;
      } else {
        finalPrompt += `Please format the response with these sections:
Recipe Name:
Ingredients:
Instructions:
Cooking Time:
Difficulty:
Alternative Ingredients (for missing ones):`;
      }

      console.log("Recipe mode prompt:", finalPrompt);
    }
    
    if (!finalPrompt || typeof finalPrompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: finalPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Increased token limit to handle multiple recipes
        }
      }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Error from Gemini API', details: errorData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract and return the response text
    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';

    return new Response(
      JSON.stringify({ 
        text: generatedText, 
        wasRecipeMode: recipeMode === true,
        wasMultipleRecipes: generateMultipleRecipes === true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in gemini function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
