import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw } from "lucide-react";
import { generatePassword, DEFAULT_PASSWORD_OPTIONS, type PasswordOptions } from "@/lib/password-generator";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useToast } from "@/hooks/use-toast";

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  value?: string;
}

export function PasswordGenerator({ onPasswordGenerated, value }: PasswordGeneratorProps) {
  const [generatedPassword, setGeneratedPassword] = useState(value || "");
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const { toast } = useToast();

  const handleGenerate = () => {
    try {
      const password = generatePassword(options);
      setGeneratedPassword(password);
      onPasswordGenerated?.(password);
    } catch (error) {
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate password",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Unable to copy password to clipboard",
        variant: "destructive",
      });
    }
  };

  const updateOptions = (updates: Partial<PasswordOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  };

  return (
    <Card className="vault-item">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Password Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Password Display */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={generatedPassword}
              readOnly
              placeholder="Generated password will appear here"
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!generatedPassword}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          {generatedPassword && (
            <PasswordStrength password={generatedPassword} />
          )}
        </div>

        {/* Length Slider */}
        <div className="space-y-3">
          <Label className="flex items-center justify-between">
            Length
            <span className="text-sm text-muted-foreground">{options.length}</span>
          </Label>
          <Slider
            value={[options.length]}
            onValueChange={([value]) => updateOptions({ length: value })}
            min={4}
            max={128}
            step={1}
            className="w-full"
          />
        </div>

        {/* Character Type Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
            <Switch
              id="uppercase"
              checked={options.includeUppercase}
              onCheckedChange={(checked) => updateOptions({ includeUppercase: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
            <Switch
              id="lowercase"
              checked={options.includeLowercase}
              onCheckedChange={(checked) => updateOptions({ includeLowercase: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="numbers">Numbers (0-9)</Label>
            <Switch
              id="numbers"
              checked={options.includeNumbers}
              onCheckedChange={(checked) => updateOptions({ includeNumbers: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="special">Special Characters</Label>
            <Switch
              id="special"
              checked={options.includeSpecialChars}
              onCheckedChange={(checked) => updateOptions({ includeSpecialChars: checked })}
            />
          </div>
        </div>

        {/* Advanced Options */}
        {options.includeNumbers && (
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              Minimum Numbers
              <span className="text-sm text-muted-foreground">{options.numberCount}</span>
            </Label>
            <Slider
              value={[options.numberCount || 0]}
              onValueChange={([value]) => updateOptions({ numberCount: value })}
              min={0}
              max={Math.floor(options.length / 2)}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {options.includeSpecialChars && (
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              Minimum Special Characters
              <span className="text-sm text-muted-foreground">{options.specialCharCount}</span>
            </Label>
            <Slider
              value={[options.specialCharCount || 0]}
              onValueChange={([value]) => updateOptions({ specialCharCount: value })}
              min={0}
              max={Math.floor(options.length / 2)}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {/* Security Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="exclude-similar">Exclude Similar Characters (i, l, 1, L, o, 0, O)</Label>
            <Switch
              id="exclude-similar"
              checked={options.excludeSimilar}
              onCheckedChange={(checked) => updateOptions({ excludeSimilar: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="exclude-ambiguous">Exclude Ambiguous Characters ({`{} [] () / \\ ' " \` ~`})</Label>
            <Switch
              id="exclude-ambiguous"
              checked={options.excludeAmbiguous}
              onCheckedChange={(checked) => updateOptions({ excludeAmbiguous: checked })}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          className="w-full security-gradient"
          size="lg"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate Password
        </Button>
      </CardContent>
    </Card>
  );
}