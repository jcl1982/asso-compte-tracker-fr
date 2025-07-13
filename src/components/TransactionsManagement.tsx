import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { useFinance, Transaction } from '@/hooks/useFinance';

export function TransactionsManagement() {
  const { accounts, transactions, categories, createTransaction, deleteTransaction, loading } = useFinance();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    account_id: '',
    amount: '',
    type: 'expense' as Transaction['type'],
    category_id: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.account_id || !newTransaction.amount) return;

    await createTransaction({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount)
    });
    
    setNewTransaction({
      account_id: '',
      amount: '',
      type: 'expense',
      category_id: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setShowCreateDialog(false);
  };

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

  const filteredCategories = categories.filter(cat => cat.type === newTransaction.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Transactions</h2>
          <p className="text-muted-foreground">
            Enregistrez et suivez toutes vos recettes et dépenses
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle transaction</DialogTitle>
              <DialogDescription>
                Enregistrez une recette ou une dépense
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-account">Compte</Label>
                <Select 
                  value={newTransaction.account_id} 
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-type">Type</Label>
                <Select 
                  value={newTransaction.type} 
                  onValueChange={(value: Transaction['type']) => {
                    setNewTransaction({ ...newTransaction, type: value, category_id: '' });
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
                <Label htmlFor="transaction-amount">Montant (€)</Label>
                <Input
                  id="transaction-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-category">Catégorie</Label>
                <Select 
                  value={newTransaction.category_id} 
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category_id: value })}
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
                <Label htmlFor="transaction-date">Date</Label>
                <Input
                  id="transaction-date"
                  type="date"
                  value={newTransaction.transaction_date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, transaction_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-description">Description (optionnel)</Label>
                <Textarea
                  id="transaction-description"
                  placeholder="Description de la transaction..."
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  Créer la transaction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune transaction enregistrée</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par enregistrer votre première transaction
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historique des transactions
            </CardTitle>
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
                {transactions.map((transaction) => (
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
                    <TableCell>{transaction.categories?.name || '-'}</TableCell>
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
                        onClick={() => deleteTransaction(transaction.id)}
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
      )}
    </div>
  );
}