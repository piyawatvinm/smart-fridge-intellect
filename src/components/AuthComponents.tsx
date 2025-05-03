import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { User, KeyRound, AtSign, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Create auth context
const AuthContext = createContext<ReturnType<typeof useAuthProvider> | undefined>(undefined);

// Auth provider hook
const useAuthProvider = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    loading: true,
    user: null as any
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setAuthState({
          loading: false,
          user: data?.session?.user || null
        });
      } catch (error) {
        console.error("Error getting session:", error);
        setAuthState({
          loading: false,
          user: null
        });
      }
    };

    getInitialSession();

    // Set up auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setAuthState({
          loading: false,
          user: session?.user || null
        });
        
        // Redirect to dashboard on login
        if (event === 'SIGNED_IN' && session) {
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);
  
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      navigate('/dashboard');
    }
    return { data, error };
  };
  
  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ')
        }
      }
    });
    return { data, error };
  };
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    }
    return { error };
  };
  
  const isAuthenticated = async () => {
    const { data } = await supabase.auth.getSession();
    return !!data.session?.user;
  };
  
  const getUser = () => {
    return authState.user;
  };
  
  return {
    login,
    register,
    logout,
    isAuthenticated,
    getUser,
    loading: authState.loading,
    user: authState.user
  };
};

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthProvider();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await login(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Login successful');
        // navigate is called in the login function and in the auth state change handler
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
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
  const { register, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await register(name, email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Registration successful! Please check your email for confirmation.');
        navigate('/login');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
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
