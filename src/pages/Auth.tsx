import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import GradientButton from "@/components/GradientButton";
import { useAuth } from '@/context/AuthContext';

// Debug flag for development
const DEBUG_SIGNUP = true; // set false later for production

const Auth = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();
  const { isAuthenticated, login, signup, signInWithGoogle } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.split('-')[1]]: value
    }));
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await login(formData.email, formData.password);
      
      if (error) {
        toast.error(error.message || "Login failed");
      } else {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    // ensure we prevent default page reloads
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      // Basic validation
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match!");
        return;
      }

      if (!formData.email || !formData.password) {
        setError("Please enter email and password.");
        return;
      }

      const payload = { email: formData.email, password: formData.password };
      console.log('[Signup] payload:', payload);

      const { error, requiresEmailConfirmation } = await signup(formData.email, formData.password);
      
      if (error) {
        setError(error.message || "Signup failed");
        toast.error(error.message || "Signup failed");
      } else {
        if (requiresEmailConfirmation) {
          setSuccess("Account created! Please check your email to verify your account.");
          toast.success("Account created! Please check your email to verify your account.");
        } else {
          setSuccess("Account created successfully! You are now logged in.");
          toast.success("Account created successfully! You are now logged in.");
          // Navigate only on success
          setTimeout(() => navigate("/"), 1000);
        }
      }
    } catch (error) {
      console.error('[Signup] unexpected error:', error);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      setIsLoading(true);
      
      try {
        const { error } = await signInWithGoogle();
        
        if (error) {
          toast.error(error.message || "Google login failed");
        }
        // Success will be handled by auth state change
      } catch (error) {
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-background to-accent/5">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 -z-10 bg-dot-pattern bg-[length:20px_20px] opacity-[0.15]"></div>
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-50"></div>
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animation-delay-2000"></div>
      
      {/* Logo and Tagline */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent animate-fade-in">
          Hired AI
        </h1>
        <p className="text-muted-foreground mt-2 animate-fade-in animation-delay-100">
          Your gateway to smarter hiring
        </p>
      </div>
      
      {/* Auth Card */}
      <Card className="w-full max-w-md mx-auto glass-card animate-scale-in animation-delay-200">
        <CardHeader>
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-6 mt-6">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <FloatingLabelInput 
                    id="login-email" 
                    type="email" 
                    label="Email"
                    required
                    onChange={handleInputChange}
                  />
                  
                  <FloatingLabelInput 
                    id="login-password" 
                    type="password" 
                    label="Password"
                    required 
                    onChange={handleInputChange}
                  />
                  
                  <div className="text-right">
                    <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  
                  <GradientButton 
                    type="submit" 
                    className="w-full h-12"
                    isLoading={isLoading}
                  >
                    Login
                  </GradientButton>
                </div>
              </form>
              
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-sm">or continue with</span>
                <div className="flex-grow border-t border-muted"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  onClick={() => handleSocialLogin("Google")}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  onClick={() => handleSocialLogin("LinkedIn")}
                  disabled={isLoading}
                >
                  <Linkedin className="text-[#0077B5] w-5 h-5" />
                  LinkedIn
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-6 mt-6">
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <FloatingLabelInput 
                    id="signup-name" 
                    type="text" 
                    label="Full Name"
                    required
                    onChange={handleInputChange}
                  />
                  
                  <FloatingLabelInput 
                    id="signup-email" 
                    type="email" 
                    label="Email"
                    required
                    onChange={handleInputChange}
                  />
                  
                  <FloatingLabelInput 
                    id="signup-password" 
                    type="password" 
                    label="Password"
                    required 
                    onChange={handleInputChange}
                  />
                  
                  <FloatingLabelInput 
                    id="signup-confirmPassword" 
                    type="password" 
                    label="Confirm Password"
                    required 
                    onChange={handleInputChange}
                  />
                  
                  <GradientButton 
                    type="submit" 
                    className="w-full h-12"
                    isLoading={isLoading}
                  >
                    Create Account
                  </GradientButton>

                  {/* Error/Success Display */}
                  {error && (
                    <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="text-green-500 text-sm mt-2 p-2 bg-green-50 rounded">
                      {success}
                    </div>
                  )}

                  {/* Debug Panel */}
                  {DEBUG_SIGNUP && (
                    <div style={{ fontSize: 12, marginTop: 8, color: "#ccc" }}>
                      <div>DEBUG_SIGNUP ON</div>
                      <div>Backend target: {(process.env?.REACT_APP_BACKEND_URL) || "relative /api/admin/create-user"}</div>
                      <div>Last status: {isLoading ? "loading..." : error ? `error: ${error}` : success ? "success" : "idle"}</div>
                    </div>
                  )}
                </div>
              </form>
              
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-sm">or sign up with</span>
                <div className="flex-grow border-t border-muted"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  onClick={() => handleSocialLogin("Google")}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  onClick={() => handleSocialLogin("LinkedIn")}
                  disabled={isLoading}
                >
                  <Linkedin className="text-[#0077B5] w-5 h-5" />
                  LinkedIn
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
        
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground">
            {activeTab === "login" ? (
              <>
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-sm text-muted-foreground text-center max-w-md">
        By signing up, you agree to our{" "}
        <a href="#" className="text-primary hover:text-primary/80 transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:text-primary/80 transition-colors">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default Auth;
