"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, Mail, User, UserPlus, CheckCircle, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

// Component that uses useSearchParams
function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loadingRecentUsers, setLoadingRecentUsers] = useState(false)

  // Fetch recent users for the community showcase
  useEffect(() => {
    const fetchRecentUsers = async () => {
      setLoadingRecentUsers(true)
      try {
        const response = await fetch('/api/user/recent?limit=5')
        const data = await response.json()
        if (data.success && data.users) {
          setRecentUsers(data.users)
        }
      } catch (error) {
        console.error('Error fetching recent users:', error)
      } finally {
        setLoadingRecentUsers(false)
      }
    }

    fetchRecentUsers()
  }, [])

  // Check for register parameter in URL
  useEffect(() => {
    if (searchParams.get("register") === "true") {
      setActiveTab("register")
    }
  }, [searchParams])

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  // Register form state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [userRole] = useState<"critic" | "viewer">("viewer") // Default to viewer
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)

  // Add these state variables to the component state
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Add the username check function
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return;
    
    setUsernameChecking(true);
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      
      setUsernameAvailable(data.available);
      setUsernameSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setUsernameChecking(false);
    }
  };

  // Add debounced username check effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (registerUsername && registerUsername.length >= 3) {
        checkUsernameAvailability(registerUsername);
      } else {
        setUsernameAvailable(null);
        setUsernameSuggestions([]);
      }
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timer);
  }, [registerUsername]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted with:", { loginEmail, loginPassword: "***" });
    
    if (!loginEmail || !loginPassword) {
      console.log("Missing email or password");
      toast({
        title: "Login failed",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoginLoading(true);

    try {
      console.log("Attempting login with auth context...");
      const result = await login(loginEmail, loginPassword);
      console.log("Login API response:", result);

      if (result.success) {
        console.log("Login successful, redirecting to home page");
        toast({
          title: "Login successful",
          description: "Welcome back to CineVerse!",
        });
        
        // Add a small delay before navigation to ensure toast is shown
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        console.error("Login failed:", result.message);
        toast({
          title: "Login failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Add form validation
  const isFormValid = loginEmail && loginPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    // Check username availability one more time before submission
    if (usernameAvailable === false) {
      toast({
        title: "Registration failed",
        description: "Username is already taken. Please choose another username.",
        variant: "destructive",
      })
      return
    }

    setIsRegisterLoading(true)

    try {
      const result = await register({
        name: registerName,
        email: registerEmail,
        username: registerUsername,
        password: registerPassword,
        role: userRole,
      })

      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Welcome to ReelCritic!",
        })
        router.push("/")
      } else {
        toast({
          title: "Registration failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRegisterLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-4 md:py-8">
      <div className="grid w-full gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Hero section - hidden on mobile */}
        <div className="hidden md:flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Join the CineVerse Community</h1>
            <p className="text-muted-foreground md:text-xl">
              Connect with fellow movie enthusiasts, share your reviews, and discover new films.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Film className="h-4 w-4" />
              <span>5,000+ Critics</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Weekly Updates</span>
            </div>
          </div>
          
          {/* Recently joined community members */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Recently Joined Critics</h3>
            <div className="flex items-center -space-x-2">
              {loadingRecentUsers ? (
                // Skeleton placeholders while loading
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background animate-pulse"></div>
                ))
              ) : recentUsers.length > 0 ? (
                // Display recent users avatars in overlapping style
                recentUsers.map((user, index) => (
                  <div key={user._id} className="relative group" title={user.name}>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-background transition-transform hover:scale-110">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || "User"}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {user.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-md px-2 py-1 text-xs whitespace-nowrap pointer-events-none">
                      {user.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Loading community members...</div>
              )}
              
              {recentUsers.length > 0 && (
                <div className="ml-2 text-sm text-muted-foreground">
                  <span>+ many more critics</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile logo */}
        <div className="flex justify-center mb-4 md:hidden">
          <Link href="/" className="flex items-center gap-0">
            <span className="font-bold text-2xl">
              <span className="text-brand-red">Reel</span>Critic
            </span>
          </Link>
        </div>

        {/* Mobile version of recently joined */}
        <div className="md:hidden mb-6">
          <h3 className="text-sm font-semibold mb-2 text-center">Recently Joined Critics</h3>
          <div className="flex items-center justify-center -space-x-2">
            {loadingRecentUsers ? (
              // Skeleton placeholders while loading
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background animate-pulse"></div>
              ))
            ) : recentUsers.length > 0 ? (
              // Display recent users avatars in overlapping style
              recentUsers.map((user, index) => (
                <div key={user._id} className="relative group" title={user.name}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-background transition-transform hover:scale-110">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || "User"}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {user.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-md px-2 py-1 text-xs whitespace-nowrap pointer-events-none">
                    {user.name}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Loading community members...</div>
            )}
            
            {recentUsers.length > 0 && (
              <div className="ml-2 text-sm text-muted-foreground">
                <span>+ many more critics</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "register")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="gap-2">
                <User className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 shadow-none md:border md:shadow">
                <CardHeader className="pb-2 pt-2 md:pt-6 md:pb-6">
                  <CardTitle className="text-xl">Login to your account</CardTitle>
                  <CardDescription className="text-sm">Enter your credentials to continue</CardDescription>
                </CardHeader>
                <CardContent>
                  <form 
                    onSubmit={handleLogin} 
                    className="space-y-3 md:space-y-4"
                  >
                    <div className="space-y-1 md:space-y-2">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm">Password</Label>
                        <Link href="/forgot-password" className="text-xs md:text-sm text-primary hover:underline">
                          Forgot?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-xs md:text-sm font-normal">Remember me</Label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!isFormValid || isLoginLoading}
                    >
                      {isLoginLoading ? "Logging in..." : "Log in"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 shadow-none md:border md:shadow">
                <CardHeader className="pb-2 pt-2 md:pt-6 md:pb-6">
                  <CardTitle className="text-xl">Create an account</CardTitle>
                  <CardDescription className="text-sm">Join the community and start reviewing</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-2">
                      <Label htmlFor="full-name" className="text-sm">Full Name</Label>
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>

                    <div className="space-y-1 md:space-y-2">
                      <Label htmlFor="register-email" className="text-sm">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-1 md:space-y-2">
                      <Label htmlFor="username" className="text-sm">Username</Label>
                      <div className="relative">
                        <Input
                          id="username"
                          type="text"
                          placeholder="johndoe"
                          value={registerUsername}
                          onChange={(e) => setRegisterUsername(e.target.value)}
                          required
                          autoComplete="username"
                          className={`pr-10 ${
                            usernameAvailable === true ? 'border-green-500 focus-visible:ring-green-500' :
                            usernameAvailable === false ? 'border-red-500 focus-visible:ring-red-500' : ''
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameChecking ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : usernameAvailable === true ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : usernameAvailable === false ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                      {usernameAvailable === false && (
                        <div className="text-xs text-red-500 space-y-1">
                          <p>Username already taken. Try one of these:</p>
                          <div className="flex flex-wrap gap-1">
                            {usernameSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setRegisterUsername(suggestion)}
                                className="px-2 py-1 bg-muted rounded-md hover:bg-primary/10 text-xs"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 md:space-y-2">
                      <Label htmlFor="register-password" className="text-sm">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="space-y-1 md:space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-xs md:text-sm font-normal">
                        I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isRegisterLoading || usernameAvailable === false || usernameChecking}
                    >
                      {isRegisterLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}




