import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Settings, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Category, Transaction } from '@/hooks/useFinance';

interface CategorizationRule {
  id: string;
  category_id: string;
  keywords: string[];
  transaction_type: 'income' | 'expense';
  priority: number;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
}

interface AutoCategorizationRulesProps {
  categories: Category[];
  onRulesUpdate?: () => void;
  fetchCategories?: () => void;
}

export function AutoCategorizationRules({ categories, onRulesUpdate, fetchCategories }: AutoCategorizationRulesProps) {
  const [rules, setRules] = useState<CategorizationRule[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState({
    category_id: '',
    keywords: '',
    transaction_type: 'expense' as Transaction['type'],
    priority: 1
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les règles
  const fetchRules = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categorization_rules')
        .select(`
          *,
          categories(name)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules((data || []) as CategorizationRule[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les règles de catégorisation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Créer une règle
  const createRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.category_id || !newRule.keywords.trim()) return;

    try {
      const keywordsArray = newRule.keywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

      const { error } = await supabase
        .from('categorization_rules')
        .insert([
          {
            category_id: newRule.category_id,
            keywords: keywordsArray,
            transaction_type: newRule.transaction_type,
            priority: newRule.priority
          }
        ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Règle de catégorisation créée avec succès"
      });

      setNewRule({
        category_id: '',
        keywords: '',
        transaction_type: 'expense',
        priority: 1
      });
      setShowCreateDialog(false);
      fetchRules();
      onRulesUpdate?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la règle",
        variant: "destructive"
      });
    }
  };

  // Supprimer une règle
  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('categorization_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Règle supprimée avec succès"
      });

      fetchRules();
      onRulesUpdate?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la règle",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRules();
  }, [user]);

  // Rafraîchir les catégories quand le dialogue s'ouvre
  useEffect(() => {
    if (showCreateDialog && fetchCategories) {
      fetchCategories();
    }
  }, [showCreateDialog, fetchCategories]);

  const filteredCategories = categories.filter(cat => cat.type === newRule.transaction_type);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Règles de Catégorisation Automatique</CardTitle>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Règle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une règle de catégorisation</DialogTitle>
                <DialogDescription>
                  Définissez des mots-clés pour catégoriser automatiquement les transactions
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={createRule} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type de transaction</Label>
                  <Select 
                    value={newRule.transaction_type} 
                    onValueChange={(value: Transaction['type']) => {
                      setNewRule({ ...newRule, transaction_type: value, category_id: '' });
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

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select 
                    value={newRule.category_id} 
                    onValueChange={(value) => setNewRule({ ...newRule, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mots-clés (séparés par des virgules)</Label>
                  <Input
                    placeholder="supermarché, courses, alimentation"
                    value={newRule.keywords}
                    onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Les mots-clés sont recherchés dans la description des transactions (insensible à la casse)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Priorité (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Les règles avec une priorité plus élevée sont appliquées en premier
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Créer la règle
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune règle configurée</h3>
            <p className="text-muted-foreground mb-4">
              Créez des règles pour catégoriser automatiquement vos transactions
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer une règle
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Mots-clés</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Badge variant={rule.transaction_type === 'income' ? 'default' : 'destructive'} className="text-xs">
                      {rule.transaction_type === 'income' ? (
                        <><TrendingUp className="h-3 w-3 mr-1" />Recette</>
                      ) : (
                        <><TrendingDown className="h-3 w-3 mr-1" />Dépense</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{rule.categories?.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {rule.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rule.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{rule.priority}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}