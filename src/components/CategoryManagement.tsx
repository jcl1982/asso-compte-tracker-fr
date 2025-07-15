import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Category } from '@/hooks/useFinance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CategoryManagementProps {
  categories: Category[];
  onCategoryCreated: () => void;
}

export function CategoryManagement({ categories, onCategoryCreated }: CategoryManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense'
  });
  const { toast } = useToast();

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name.trim(),
          type: newCategory.type
        }]);

      if (error) throw error;

      toast({
        title: "Catégorie créée",
        description: `La catégorie "${newCategory.name}" a été créée avec succès.`,
      });

      setNewCategory({ name: '', type: 'expense' });
      setShowCreateDialog(false);
      onCategoryCreated();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie. Vérifiez vos permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Catégorie supprimée",
        description: `La catégorie "${categoryName}" a été supprimée.`,
      });

      onCategoryCreated(); // Refresh the categories
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie.",
        variant: "destructive",
      });
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Gestion des Catégories
            </CardTitle>
            <CardDescription>
              Créez et gérez les catégories pour organiser vos transactions
            </CardDescription>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
                <DialogDescription>
                  Ajoutez une catégorie pour organiser vos transactions
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Nom de la catégorie</Label>
                  <Input
                    id="category-name"
                    placeholder="Ex: Alimentation, Salaires..."
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-type">Type</Label>
                  <Select 
                    value={newCategory.type} 
                    onValueChange={(value: 'income' | 'expense') => {
                      setNewCategory({ ...newCategory, type: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                          Recette
                        </div>
                      </SelectItem>
                      <SelectItem value="expense">
                        <div className="flex items-center">
                          <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                          Dépense
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Créer la catégorie
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Catégories de recettes */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Catégories de Recettes ({incomeCategories.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map((category) => (
              <Badge key={category.id} variant="secondary" className="flex items-center gap-2">
                {category.name}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-auto p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {incomeCategories.length === 0 && (
              <p className="text-muted-foreground text-sm">Aucune catégorie de recette</p>
            )}
          </div>
        </div>

        {/* Catégories de dépenses */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            Catégories de Dépenses ({expenseCategories.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((category) => (
              <Badge key={category.id} variant="secondary" className="flex items-center gap-2">
                {category.name}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-auto p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {expenseCategories.length === 0 && (
              <p className="text-muted-foreground text-sm">Aucune catégorie de dépense</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}