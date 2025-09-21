import { useAuth } from "@/contexts/AuthContext";
import { MasterPasswordSetup } from "@/components/MasterPasswordSetup";
import { LoginScreen } from "@/components/LoginScreen";
import { PasswordVault } from "@/components/PasswordVault";
import { Shield } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading, hasVault, checkAuth } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vault-bg">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold mb-2">SecureVault</h1>
          <p className="text-muted-foreground">Initializing secure password manager...</p>
        </div>
      </div>
    );
  }

  if (!hasVault) {
    return <MasterPasswordSetup onSetupComplete={checkAuth} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <PasswordVault />;
};

export default Index;
