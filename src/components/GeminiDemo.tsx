
import React, { useState } from 'react';
import { useGemini } from '@/hooks/use-gemini';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export const GeminiDemo = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  
  const { generateContent, isLoading } = useGemini({
    onSuccess: (text) => {
      setResponse(text);
      toast({
        title: 'Success',
        description: 'Response generated successfully',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await generateContent(prompt);
    if (result) {
      setResponse(result);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Gemini AI Demo</CardTitle>
          <CardDescription>
            Ask Gemini anything and get AI-generated responses using Google's Gemini 1.5 Flash model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full gap-2">
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32"
                disabled={isLoading}
              />
            </div>
            <div>
              <Button type="submit" className="w-full" disabled={isLoading || !prompt.trim()}>
                {isLoading ? 'Generating...' : 'Generate Response'}
              </Button>
            </div>
          </form>

          {response && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Response:</h3>
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{response}</div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            Powered by Google's Gemini 1.5 Flash model
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
