import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Wallet, Building2, Gift, Users } from 'lucide-react';
import { useFinance, Account } from '@/hooks/useFinance';

const accountTypeLabels = {
  bank: 'Compte bancaire',
  cash: 'Espèces',
  grants: 'Subventions',
  dues: 'Cotisations'
};

const accountTypeIcons = {
  bank: Building2,
  cash: Wallet,
  grants: Gift,
  dues: Users
};

export function AccountsManagement() {
  const { accounts, createAccount, deleteAccount, loading } = useFinance();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'bank' as Account['type']
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name.trim()) return;

    await createAccount(newAccount);
    setNewAccount({ name: '', type: 'bank' });
    setShowCreateDialog(false);
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(balance);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Comptes</h2>
          <p className="text-muted-foreground">
            Gérez vos comptes bancaires, espèces, subventions et cotisations
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Compte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau compte</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau compte pour organiser vos finances
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-name">Nom du compte</Label>
                <Input
                  id="account-name"
                  placeholder="Ex: Compte courant principal"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-type">Type de compte</Label>
                <Select 
                  value={newAccount.type} 
                  onValueChange={(value: Account['type']) => setNewAccount({ ...newAccount, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(accountTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  Créer le compte
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun compte configuré</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par créer votre premier compte pour gérer vos finances
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un compte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = accountTypeIcons[account.type];
            return (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {accountTypeLabels[account.type]}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAccount(account.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={getBalanceColor(Number(account.balance))}>
                      {formatBalance(Number(account.balance))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créé le {new Date(account.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}