import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { Transaction, Account, Category } from '@/hooks/useFinance';

interface TransactionEditFormProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  loading: boolean;
  onUpdateTransaction: (transactionId: string, updates: Partial<Transaction>) => Promise<void>;
}

export function TransactionEditForm({ 
  transaction, 
  accounts, 
  categories, 
  loading, 
  onUpdateTransaction 
}: TransactionEditFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_id: transaction.account_id,
    type: transaction.type as 'income' | 'expense',
    amount: transaction.amount.toString(),
    category_id: transaction.category_id || '',
    transaction_date: new Date(transaction.transaction_date).toISOString().split('T')[0],
    description: transaction.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updates = {
        account_id: formData.account_id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null,
        transaction_date: formData.transaction_date,
        description: formData.description || null
      };
      
      await onUpdateTransaction(transaction.id, updates);
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la modification de la transaction:', error);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account">Compte</Label>
            <Select 
              value={formData.account_id} 
              onValueChange={(value) => setFormData({...formData, account_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un compte" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value, category_id: ''})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Recette</SelectItem>
                <SelectItem value="expense">Dépense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData({...formData, category_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune catégorie</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la transaction"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}