
import React, { useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Camera, Loader2, Wand2 } from "lucide-react";

interface ImageUploaderProps {
  file: File | null;
  preview: string | null;
  isLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onReset: () => void;
  onGenerate: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  file,
  preview,
  isLoading,
  onFileChange,
  onDragOver,
  onDrop,
  onReset,
  onGenerate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
        <CardDescription>
          Upload any food image to generate ingredients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center h-64 ${
            !preview ? "border-gray-300 bg-gray-50" : "border-transparent"
          }`}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Food image preview"
                className="w-full h-full object-contain"
              />
              <button
                onClick={onReset}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                type="button"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <p className="text-gray-600 mb-2">
                Drag and drop your food image here
              </p>
              <p className="text-gray-500 text-sm mb-4">
                or click to browse for a file
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
              >
                Browse Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={onFileChange}
              />
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={!file || isLoading}
        >
          Cancel
        </Button>
        {file && (
          <div className="flex space-x-2">
            <Button
              onClick={triggerFileInput}
              variant="outline"
              disabled={isLoading}
            >
              <Camera className="h-4 w-4 mr-2" />
              New Photo
            </Button>
            <Button
              onClick={onGenerate}
              disabled={!file || isLoading}
              className="bg-fridge-blue hover:bg-fridge-blue-light"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Items
                </>
              )}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
