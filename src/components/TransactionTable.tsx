import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Calendar, TrendingUp, TrendingDown, Zap, Filter } from 'lucide-react';
import { Transaction, Category } from '@/hooks/useFinance';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  onDeleteTransaction: (transactionId: string) => Promise<void>;
  onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => Promise<void>;
  onApplyCategorization: () => Promise<number>;
}

export function TransactionTable({ 
  transactions, 
  categories, 
  loading, 
  onDeleteTransaction, 
  onUpdateTransaction, 
  onApplyCategorization 
}: TransactionTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    if (categoryFilter === 'all') {
      return transactions;
    } else if (categoryFilter === 'none') {
      return transactions.filter(t => !t.category_id);
    } else {
      return transactions.filter(t => t.category_id === categoryFilter);
    }
  }, [transactions, categoryFilter]);

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
    
    return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const getAmountColor = (type: Transaction['type']) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const handleCategoryChange = async (transactionId: string, categoryId: string, transactionType: Transaction['type']) => {
    const validCategories = categories.filter(cat => cat.type === transactionType);
    const selectedCategory = validCategories.find(cat => cat.id === categoryId);
    
    if (!selectedCategory && categoryId !== 'none') return;
    
    await onUpdateTransaction(transactionId, { 
      category_id: categoryId === 'none' ? null : categoryId 
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des transactions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="none">Sans catégorie</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.type === 'income' ? 'Recette' : 'Dépense'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onApplyCategorization}
              disabled={loading}
            >
              <Zap className="h-4 w-4 mr-2" />
              Auto-catégoriser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Compte</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.transaction_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>{transaction.accounts?.name}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                    {transaction.type === 'income' ? (
                      <><TrendingUp className="h-3 w-3 mr-1" />Recette</>
                    ) : (
                      <><TrendingDown className="h-3 w-3 mr-1" />Dépense</>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={transaction.category_id || 'none'}
                    onValueChange={(value) => handleCategoryChange(transaction.id, value, transaction.type)}
                  >
                    <SelectTrigger className="w-full max-w-[200px]">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">Aucune catégorie</span>
                      </SelectItem>
                      {categories
                        .filter(cat => cat.type === transaction.type)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {transaction.description || '-'}
                </TableCell>
                <TableCell className={`text-right font-medium ${getAmountColor(transaction.type)}`}>
                  {formatAmount(Number(transaction.amount), transaction.type)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}