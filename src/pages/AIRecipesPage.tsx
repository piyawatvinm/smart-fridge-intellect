
import { useState } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronDown, ChevronUp, ShoppingCart, RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/AuthComponents';
import { useRecipeGeneration } from '@/hooks/useRecipeGeneration';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AIRecipesPage() {
  const auth = useAuth();
  const userId = auth.user?.id;
  
  const {
    userIngredients,
    generatedRecipes,
    loadUserIngredients,
    generateRecipes,
    generatingRecipes,
    loadingIngredients,
    addMissingIngredientsToCart,
    addingToCart
  } = useRecipeGeneration(userId);
  
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState<number | null>(null);

  const toggleRecipeExpand = (index: number) => {
    setExpandedRecipeIndex(expandedRecipeIndex === index ? null : index);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Recipe Recommendations</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadUserIngredients} 
              disabled={loadingIngredients}
              className="flex items-center gap-2"
            >
              {loadingIngredients && <Loader2 className="h-4 w-4 animate-spin" />}
              Refresh Ingredients
            </Button>
            <Button 
              onClick={generateRecipes} 
              disabled={generatingRecipes || userIngredients.length === 0}
              className="flex items-center gap-2"
            >
              {generatingRecipes ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Generate AI Recipes
            </Button>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {generatingRecipes ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Generating recipe recommendations based on your ingredients...</p>
            </div>
          ) : generatedRecipes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <p className="text-lg text-center mb-4">No AI recipes generated yet. Click the button above to generate recipes based on your ingredients.</p>
                {userIngredients.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">You need to add ingredients first. Go to the Ingredients page.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedRecipes.map((recipe, index) => (
                <RecipeCard 
                  key={`ai-${index}`}
                  recipe={recipe}
                  index={index}
                  isExpanded={expandedRecipeIndex === index}
                  toggleExpand={() => toggleRecipeExpand(index)}
                  onAddToCart={() => addMissingIngredientsToCart(index, 'generated')}
                  isAddingToCart={addingToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

interface RecipeCardProps {
  recipe: any;
  index: number;
  isExpanded: boolean;
  toggleExpand: () => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

function RecipeCard({ recipe, index, isExpanded, toggleExpand, onAddToCart, isAddingToCart }: RecipeCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{recipe.name}</CardTitle>
            {recipe.description && <CardDescription className="mt-2">{recipe.description}</CardDescription>}
          </div>
          <Badge className={`${recipe.matchScore >= 80 ? 'bg-green-500' : recipe.matchScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}>
            {recipe.matchScore}% Match
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
          {recipe.cookingTime && <span>⏱️ {recipe.cookingTime}</span>}
          {recipe.difficulty && <span>🔥 {recipe.difficulty}</span>}
          {recipe.category && <span>🍽️ {recipe.category}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="available">
              <AccordionTrigger className="text-sm font-medium">
                Available Ingredients ({recipe.availableIngredients.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 text-sm">
                  {recipe.availableIngredients.map((ing: any, i: number) => (
                    <li key={`avail-${i}`} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {ing.name}
                      {ing.quantity && ing.unit && <span className="text-muted-foreground ml-1">({ing.quantity} {ing.unit})</span>}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="missing">
              <AccordionTrigger className="text-sm font-medium">
                Missing Ingredients ({recipe.missingIngredients.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 text-sm">
                  {recipe.missingIngredients.map((ing: any, i: number) => (
                    <li key={`missing-${i}`} className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      {ing.name}
                      {ing.quantity && ing.unit && <span className="text-muted-foreground ml-1">({ing.quantity} {ing.unit})</span>}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {recipe.instructions && recipe.instructions.length > 0 && (
              <AccordionItem value="instructions">
                <AccordionTrigger className="text-sm font-medium">
                  Instructions
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {recipe.instructions.map((step: string, i: number) => (
                      <li key={`step-${i}`} className="pl-1">{step}</li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleExpand}
          className="text-xs flex items-center gap-1"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
        
        {recipe.missingIngredients.length > 0 && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onAddToCart}
            disabled={isAddingToCart}
            className="text-xs flex items-center gap-1"
          >
            {isAddingToCart ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingCart className="h-3 w-3" />}
            Add Missing Items to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
