
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronRight, Receipt, List, ChefHat, ShoppingCart } from "lucide-react";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Welcome to Smart Fridge",
      description: "Keep track of your food items, reduce waste, and discover new recipes",
      buttonText: "Get Started",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Scan Receipts",
      description: "Automatically add groceries to your inventory by scanning your receipts",
      buttonText: "Next",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1558888401-3cc1de77652d?auto=format&fit=crop&w=800&q=80",
      icon: <Receipt className="h-6 w-6 mr-2" />
    },
    {
      title: "Track Expiration Dates",
      description: "Get notified when food is about to expire so you can use it before it's too late",
      buttonText: "Next",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80",
      icon: <List className="h-6 w-6 mr-2" />
    },
    {
      title: "Recipe Recommendations",
      description: "Get personalized recipe ideas based on the ingredients you have at home",
      buttonText: "Next",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
      icon: <ChefHat className="h-6 w-6 mr-2" />
    },
    {
      title: "Grocery Links",
      description: "Connect with grocery stores for easy shopping of missing ingredients",
      buttonText: "Get Started",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
      icon: <ShoppingCart className="h-6 w-6 mr-2" />
    }
  ];
  
  const handleNextSlide = () => {
    if (currentSlide === slides.length - 1) {
      navigate("/login");
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  // Auto progress slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    }, 6000);
    
    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);
  
  const currentSlideData = slides[currentSlide];
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full h-full fixed top-0 left-0 bg-gradient-to-br from-fridge-blue to-fridge-blue-light" />
      
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-10 max-w-md w-full text-white text-center">
        <div className="absolute top-0 right-0 p-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={() => navigate("/login")}
          >
            Skip
          </Button>
        </div>
        
        <div className="mb-8">
          <div className="w-64 h-64 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse" />
            {currentSlideData.image && (
              <img 
                src={currentSlideData.image} 
                alt={currentSlideData.title} 
                className="w-full h-full object-contain rounded-full animate-fade-in p-4" 
              />
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-4 animate-slide-up">
            {currentSlideData.title}
          </h1>
          <p className="text-white/80 mb-8 animate-slide-up">
            {currentSlideData.description}
          </p>
        </div>
        
        <div className="flex justify-center mb-8 space-x-2">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 bg-white" 
                  : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
        
        <Button 
          className="w-full bg-white text-fridge-blue hover:bg-white/90 animate-slide-up"
          onClick={handleNextSlide}
        >
          {currentSlideData.icon}
          {currentSlideData.buttonText}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
        
        {currentSlide === 0 && (
          <div className="mt-4 text-white/80 text-sm animate-fade-in">
            <p>Already have an account? <button onClick={() => navigate("/login")} className="underline">Log in</button></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
