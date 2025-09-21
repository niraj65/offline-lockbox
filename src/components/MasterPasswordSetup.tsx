import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { PasswordStrength } from "@/components/ui/password-strength";
import { createValidationData } from "@/lib/encryption";
import { storeMasterPasswordValidation, storeVaultData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface MasterPasswordSetupProps {
  onSetupComplete: () => void;
}

export function MasterPasswordSetup({ onSetupComplete }: MasterPasswordSetupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Master password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create validation data
      const validationData = createValidationData(password);
      await storeMasterPasswordValidation(validationData);
      
      // Initialize empty vault
      const initialVault = {
        entries: [],
        version: "1.0.0",
      };
      await storeVaultData(initialVault, password);
      
      toast({
        title: "Setup Complete!",
        description: "Your secure vault has been created successfully.",
      });
      
      onSetupComplete();
    } catch (error) {
      console.error('Setup failed:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to create your secure vault. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-vault-bg">
      <Card className="w-full max-w-md vault-item security-glow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full security-gradient flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create Master Password</CardTitle>
            <p className="text-muted-foreground mt-2">
              This password will protect all your saved passwords. Make it strong and memorable.
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Master Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  required
                  className="pr-10"
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
              
              {password && (
                <PasswordStrength password={password} className="mt-3" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Master Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your master password"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Your master password cannot be recovered if forgotten. 
                Make sure to remember it or store it safely.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              className="w-full security-gradient" 
              size="lg"
              disabled={!password || !confirmPassword || password !== confirmPassword || isLoading}
            >
              {isLoading ? "Creating Vault..." : "Create Secure Vault"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}