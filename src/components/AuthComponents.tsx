
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { User, KeyRound, AtSign, Eye, EyeOff } from 'lucide-react';

// Mock auth service - in a real app, this would connect to a backend
const mockAuth = {
  login: (email: string, password: string) => {
    return new Promise<{success: boolean, message: string}>((resolve) => {
      setTimeout(() => {
        if (email === 'user@example.com' && password === 'password') {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify({email, name: 'Demo User'}));
          resolve({success: true, message: 'Login successful'});
        } else {
          resolve({success: false, message: 'Invalid credentials'});
        }
      }, 1000);
    });
  },
  register: (name: string, email: string, password: string) => {
    return new Promise<{success: boolean, message: string}>((resolve) => {
      setTimeout(() => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({email, name}));
        resolve({success: true, message: 'Registration successful'});
      }, 1000);
    });
  },
  logout: () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  },
  isAuthenticated: () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await mockAuth.login(email, password);
      
      if (result.success) {
        toast.success(result.message);
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 wave-bg">
      <Card className="w-full max-w-md shadow-xl animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-blue hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate('/register')}
              className="text-fridge-blue hover:underline"
            >
              Sign up
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await mockAuth.register(name, email, password);
      
      if (result.success) {
        toast.success(result.message);
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 wave-bg">
      <Card className="w-full max-w-md shadow-xl animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-blue hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <button 
              onClick={() => navigate('/login')}
              className="text-fridge-blue hover:underline"
            >
              Sign in
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export const useAuth = () => {
  const navigate = useNavigate();
  
  const login = async (email: string, password: string) => {
    const result = await mockAuth.login(email, password);
    return result;
  };
  
  const register = async (name: string, email: string, password: string) => {
    const result = await mockAuth.register(name, email, password);
    return result;
  };
  
  const logout = () => {
    mockAuth.logout();
    navigate('/login');
  };
  
  const isAuthenticated = () => {
    return mockAuth.isAuthenticated();
  };
  
  const getUser = () => {
    return mockAuth.getUser();
  };
  
  return {
    login,
    register,
    logout,
    isAuthenticated,
    getUser
  };
};
