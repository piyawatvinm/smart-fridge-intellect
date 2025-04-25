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
      image: "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Scan Receipts",
      description: "Automatically add groceries to your inventory by scanning your receipts",
      buttonText: "Next",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
      icon: <Receipt className="h-6 w-6 mr-2" />
    },
    {
      title: "Track Expiration Dates",
      description: "Get notified when food is about to expire so you can use it before it's too late",
      buttonText: "Next",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1553546895-531931aa1aa8?auto=format&fit=crop&w=800&q=80",
      icon: <List className="h-6 w-6 mr-2" />
    },
    {
      title: "Recipe Recommendations",
      description: "Get personalized recipe ideas based on the ingredients you have at home",
      buttonText: "Next",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80",
      icon: <ChefHat className="h-6 w-6 mr-2" />
    },
    {
      title: "Grocery Links",
      description: "Connect with grocery stores for easy shopping of missing ingredients",
      buttonText: "Get Started",
      color: "bg-gradient-blue",
      image: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=800&q=80",
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
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white to-gray-50">
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-12 max-w-md w-full text-center">
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            className="text-gray-600 hover:bg-gray-100/80 transition-colors"
            onClick={() => navigate("/login")}
          >
            Skip
          </Button>
        </div>
        
        <div className="mb-12 space-y-8">
          <div className="w-72 h-72 mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-fridge-blue/5 to-fridge-blue-light/5 rounded-2xl" />
            {currentSlideData.image && (
              <img 
                src={currentSlideData.image} 
                alt={currentSlideData.title} 
                className="w-full h-full object-cover rounded-2xl shadow-lg transform transition-transform duration-500 hover:scale-105" 
              />
            )}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              {currentSlideData.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentSlideData.description}
            </p>
          </div>
        </div>
        
        <div className="flex justify-center mb-10 space-x-2">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 bg-fridge-blue" 
                  : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
        
        <div className="w-full space-y-4">
          <Button 
            className="w-full h-12 bg-fridge-blue hover:bg-fridge-blue-light transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={handleNextSlide}
          >
            {currentSlideData.icon}
            {currentSlideData.buttonText}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          
          {currentSlide === 0 && (
            <div className="text-gray-600 text-sm animate-fade-in">
              <p>Already have an account? <button onClick={() => navigate("/login")} className="text-fridge-blue hover:text-fridge-blue-light underline transition-colors">Log in</button></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
