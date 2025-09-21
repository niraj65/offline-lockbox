import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Plus, X, Wand2 } from "lucide-react";
import { PasswordGenerator } from "./PasswordGenerator";
import { PasswordStrength } from "@/components/ui/password-strength";
import type { PasswordEntry } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface AddEditPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: PasswordEntry | null;
  onSave: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddEditPasswordDialog({ 
  open, 
  onOpenChange, 
  entry, 
  onSave 
}: AddEditPasswordDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    website: "",
    username: "",
    password: "",
    notes: "",
    tags: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        website: entry.website,
        username: entry.username,
        password: entry.password,
        notes: entry.notes,
        tags: entry.tags,
      });
    } else {
      setFormData({
        title: "",
        website: "",
        username: "",
        password: "",
        notes: "",
        tags: [],
      });
    }
    setShowPassword(false);
    setShowGenerator(false);
  }, [entry, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for this password entry.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Missing Password",
        description: "Please enter a password.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      title: formData.title.trim(),
      website: formData.website.trim(),
      username: formData.username.trim(),
      password: formData.password,
      notes: formData.notes.trim(),
      tags: formData.tags,
    });

    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePasswordGenerated = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    setShowGenerator(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? "Edit Password" : "Add New Password"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Google Account"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="e.g., google.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username/Email</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="e.g., user@example.com"
            />
          </div>

          {/* Password Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowGenerator(!showGenerator)}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {showGenerator ? "Hide Generator" : "Generate Password"}
              </Button>
            </div>
            
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
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

            {formData.password && (
              <PasswordStrength password={formData.password} />
            )}

            {showGenerator && (
              <>
                <Separator />
                <PasswordGenerator
                  onPasswordGenerated={handlePasswordGenerated}
                  value={formData.password}
                />
              </>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="security-gradient">
              {entry ? "Update Password" : "Save Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}