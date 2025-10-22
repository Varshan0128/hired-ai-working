// src/pages/Auth.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { toast } from "sonner";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import GradientButton from "@/components/GradientButton";
import { useAuth } from '@/context/AuthContext';

// Debug flag for development
const DEBUG_SIGNUP = false;

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // keep internal error/success but we'll show user-facing messages with toast
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
    const key = id.split('-')[1] || id;
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // clear any inline states when switching tabs
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await login(formData.email.trim(), formData.password);

      if (error) {
        toast.error(error.message || "Login failed");
      } else {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err) {
      console.error("[Auth] login error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // === SUPABASE-ONLY SIGNUP (permanent) ===
  const handleSignup = async (e: React.FormEvent) => {
    if (e && typeof (e as any).preventDefault === "function") (e as any).preventDefault();

    // clear local state
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Basic client-side validation
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match!");
        return;
      }
      if (!formData.email || !formData.password) {
        toast.error("Please enter email and password.");
        return;
      }

      // Call the signup method from your AuthContext (Supabase)
      const { error: supError } = await signup(formData.email.trim(), formData.password);

      if (supError) {
        console.warn("[Auth] Supabase signup error:", supError);
        toast.error(supError.message || "Signup failed. Try again.");
        return;
      }

      // Success: Supabase will handle email confirmation if configured
      toast.success("Account created! Check your email to verify (if required).");
      setActiveTab("login");
      // Optionally clear form fields
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      console.error("[Auth] Unexpected signup error:", err);
      toast.error("Unexpected error during signup. See console.");
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
        // success handled by auth state change
      } catch (err) {
        console.error("[Auth] social login error:", err);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    } else if (provider === 'LinkedIn') {
      // LinkedIn handler not implemented in current code path
      toast.error("LinkedIn login not implemented yet");
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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                    value={formData.email}
                  />

                  <FloatingLabelInput
                    id="login-password"
                    type="password"
                    label="Password"
                    required
                    onChange={handleInputChange}
                    value={formData.password}
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
                    value={formData.name}
                  />

                  <FloatingLabelInput
                    id="signup-email"
                    type="email"
                    label="Email"
                    required
                    onChange={handleInputChange}
                    value={formData.email}
                  />

                  <FloatingLabelInput
                    id="signup-password"
                    type="password"
                    label="Password"
                    required
                    onChange={handleInputChange}
                    value={formData.password}
                  />

                  <FloatingLabelInput
                    id="signup-confirmPassword"
                    type="password"
                    label="Confirm Password"
                    required
                    onChange={handleInputChange}
                    value={formData.confirmPassword}
                  />

                  <GradientButton
                    type="submit"
                    className="w-full h-12"
                    isLoading={isLoading}
                  >
                    Create Account
                  </GradientButton>

                  {/* We removed inline server error display; errors will be shown using toast notifications */}
                  {/* If you still want a small persistent message area, enable show-success via state and render it here. */}

                  {/* Debug Panel (disabled in production) */}
                  {DEBUG_SIGNUP && (
                    <div style={{ fontSize: 12, marginTop: 8, color: "#ddd" }}>
                      <div><strong>DEBUG_SIGNUP ON</strong></div>
                      <div>State: {isLoading ? "loading..." : error ? `error: ${error}` : success ? "success" : "idle"}</div>
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
