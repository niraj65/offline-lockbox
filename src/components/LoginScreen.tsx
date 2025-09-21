import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Fingerprint, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function LoginScreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(true);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(password);
      
      if (!success) {
        toast({
          title: "Login Failed",
          description: "Invalid master password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    // TODO: Implement biometric authentication with Capacitor
    toast({
      title: "Biometric Authentication",
      description: "Biometric authentication will be available in the mobile app.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-vault-bg">
      <Card className="w-full max-w-md vault-item security-glow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full security-gradient flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Unlock Your Vault</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter your master password to access your saved passwords.
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {showBiometric && (
            <Button
              onClick={handleBiometricAuth}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Fingerprint className="mr-2 h-5 w-5" />
              Use Biometric Authentication
            </Button>
          )}
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with password
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="masterPassword">Master Password</Label>
              <div className="relative">
                <Input
                  id="masterPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  required
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full security-gradient" 
              size="lg"
              disabled={!password || isLoading}
            >
              {isLoading ? "Unlocking..." : "Unlock Vault"}
            </Button>
          </form>

          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your passwords are protected with AES-256-GCM encryption and stored locally on your device.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}