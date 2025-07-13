import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Account, Category, Transaction } from '@/hooks/useFinance';

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  loading: boolean;
  onCreateTransaction: (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'accounts' | 'categories'>) => Promise<void>;
}

export function TransactionForm({ accounts, categories, loading, onCreateTransaction }: TransactionFormProps) {
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

    await onCreateTransaction({
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

  const filteredCategories = categories.filter(cat => cat.type === newTransaction.type);

  return (
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
  );
}