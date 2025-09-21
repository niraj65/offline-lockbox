import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  ExternalLink,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PasswordEntry as PasswordEntryType } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PasswordEntryProps {
  entry: PasswordEntryType;
  onEdit: (entry: PasswordEntryType) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function PasswordEntry({ entry, onEdit, onDelete, className }: PasswordEntryProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: `Unable to copy ${type.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };

  const openWebsite = () => {
    if (entry.website) {
      const url = entry.website.startsWith('http') 
        ? entry.website 
        : `https://${entry.website}`;
      window.open(url, '_blank');
    }
  };

  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Card className={cn("vault-item transition-all duration-200 hover:scale-[1.02]", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials(entry.title)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base truncate">{entry.title}</h3>
              {entry.website && (
                <p className="text-sm text-muted-foreground truncate">
                  {getDomain(entry.website)}
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {entry.website && (
                <DropdownMenuItem onClick={openWebsite}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Website
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(entry.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Username */}
        {entry.username && (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-sm font-mono truncate">{entry.username}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => handleCopy(entry.username, "Username")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Password */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Password</p>
            <p className="text-sm font-mono truncate">
              {showPassword ? entry.password : "•".repeat(entry.password.length)}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleCopy(entry.password, "Password")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Notes */}
        {entry.notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>
          </div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{entry.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground">
          Updated {new Date(entry.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}