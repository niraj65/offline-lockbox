import { Progress } from "@/components/ui/progress";
import { estimatePasswordStrength } from "@/lib/password-generator";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = estimatePasswordStrength(password);
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password Strength</span>
        <span className={cn(
          "font-medium",
          {
            "text-destructive": strength.color === "destructive",
            "text-accent": strength.color === "accent", 
            "text-primary": strength.color === "primary",
          }
        )}>
          {strength.label}
        </span>
      </div>
      <Progress 
        value={strength.score} 
        className={cn(
          "h-2",
          {
            "[&>div]:bg-destructive": strength.color === "destructive",
            "[&>div]:bg-accent": strength.color === "accent",
            "[&>div]:bg-primary": strength.color === "primary",
          }
        )}
      />
    </div>
  );
}