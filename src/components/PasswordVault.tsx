import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Lock, 
  Settings, 
  LogOut,
  Shield,
  Download,
  Upload,
  Filter
} from "lucide-react";
import { PasswordEntry } from "./PasswordEntry";
import { AddEditPasswordDialog } from "./AddEditPasswordDialog";
import { useAuth } from "@/contexts/AuthContext";
import { getVaultData, storeVaultData, type PasswordEntry as PasswordEntryType, type VaultData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export function PasswordVault() {
  const [vaultData, setVaultData] = useState<VaultData>({ entries: [], version: "1.0.0" });
  const [filteredEntries, setFilteredEntries] = useState<PasswordEntryType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntryType | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();
  const { toast } = useToast();

  // Get master password from memory
  const getMasterPassword = () => (window as any).__masterPassword;

  // Load vault data
  useEffect(() => {
    loadVaultData();
  }, []);

  // Filter entries based on search and tag
  useEffect(() => {
    let filtered = vaultData.entries;

    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(entry => entry.tags.includes(selectedTag));
    }

    setFilteredEntries(filtered);
  }, [vaultData.entries, searchQuery, selectedTag]);

  const loadVaultData = async () => {
    try {
      setIsLoading(true);
      const masterPassword = getMasterPassword();
      if (!masterPassword) {
        logout();
        return;
      }

      const data = await getVaultData(masterPassword);
      if (data) {
        setVaultData(data);
      }
    } catch (error) {
      console.error('Failed to load vault:', error);
      toast({
        title: "Load Error",
        description: "Failed to load your password vault.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveVaultData = async (newVaultData: VaultData) => {
    try {
      const masterPassword = getMasterPassword();
      if (!masterPassword) {
        logout();
        return;
      }

      await storeVaultData(newVaultData, masterPassword);
      setVaultData(newVaultData);
    } catch (error) {
      console.error('Failed to save vault:', error);
      toast({
        title: "Save Error",
        description: "Failed to save your password vault.",
        variant: "destructive",
      });
    }
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setIsAddEditOpen(true);
  };

  const handleEditEntry = (entry: PasswordEntryType) => {
    setEditingEntry(entry);
    setIsAddEditOpen(true);
  };

  const handleSaveEntry = async (entryData: Omit<PasswordEntryType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingEntry) {
      // Update existing entry
      const updatedEntries = vaultData.entries.map(entry =>
        entry.id === editingEntry.id
          ? { ...entry, ...entryData, updatedAt: now }
          : entry
      );
      
      await saveVaultData({ ...vaultData, entries: updatedEntries });
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    } else {
      // Add new entry
      const newEntry: PasswordEntryType = {
        ...entryData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      
      await saveVaultData({
        ...vaultData,
        entries: [...vaultData.entries, newEntry]
      });
      
      toast({
        title: "Password Added",
        description: "Your password has been saved successfully.",
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const updatedEntries = vaultData.entries.filter(entry => entry.id !== entryId);
    await saveVaultData({ ...vaultData, entries: updatedEntries });
    
    toast({
      title: "Password Deleted",
      description: "The password has been removed from your vault.",
    });
    
    setDeleteEntryId(null);
  };

  const getAllTags = () => {
    const allTags = vaultData.entries.flatMap(entry => entry.tags);
    return Array.from(new Set(allTags)).sort();
  };

  const exportVault = async () => {
    try {
      const dataStr = JSON.stringify(vaultData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `password-vault-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your vault has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your vault.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vault-bg">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading your secure vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg security-gradient flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SecureVault</h1>
                <p className="text-sm text-muted-foreground">
                  {vaultData.entries.length} passwords stored
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={exportVault}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleAddEntry} className="security-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Add Password
            </Button>
          </div>

          {/* Tag Filters */}
          {getAllTags().length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Button>
              {getAllTags().map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Password Entries */}
        {vaultData.entries.length === 0 ? (
          <Card className="vault-item text-center py-12">
            <CardContent>
              <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Your vault is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first password to keep it secure.
              </p>
              <Button onClick={handleAddEntry} className="security-gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Password
              </Button>
            </CardContent>
          </Card>
        ) : filteredEntries.length === 0 ? (
          <Card className="vault-item text-center py-12">
            <CardContent>
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No passwords found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <PasswordEntry
                key={entry.id}
                entry={entry}
                onEdit={handleEditEntry}
                onDelete={setDeleteEntryId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <AddEditPasswordDialog
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        entry={editingEntry}
        onSave={handleSaveEntry}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEntryId} onOpenChange={() => setDeleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Password</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this password? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEntryId && handleDeleteEntry(deleteEntryId)}
              className="danger-gradient"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}