import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Shield } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { useProfile } from '@/hooks/useProfile';
import { BankStatementImport } from './BankStatementImport';
import { AutoCategorizationRules } from './AutoCategorizationRules';
import { TransactionForm } from './TransactionForm';
import { TransactionTable } from './TransactionTable';
import { CategoryManagement } from './CategoryManagement';

export function TransactionsManagement() {
  const { 
    accounts, 
    transactions, 
    categories, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction, 
    loading, 
    applyCategorization,
    fetchCategories
  } = useFinance();
  
  const { isAdmin } = useProfile();

  const handleCreateTransaction = async (transactionData: Parameters<typeof createTransaction>[0]) => {
    await createTransaction(transactionData);
  };

  const handleUpdateTransaction = async (transactionId: string, updates: Parameters<typeof updateTransaction>[1]) => {
    await updateTransaction(transactionId, updates);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteTransaction(transactionId);
  };

  const handleApplyCategorization = async () => {
    return await applyCategorization();
  };

  // Si l'utilisateur n'est pas admin, afficher un message d'accès refusé
  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-destructive/10 p-3 rounded-full w-fit mx-auto mb-4">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">Accès refusé</h3>
          <p className="text-muted-foreground text-center">
            Seuls les administrateurs peuvent saisir et gérer les transactions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Transactions</h2>
          <p className="text-muted-foreground">
            Enregistrez et suivez toutes vos recettes et dépenses
          </p>
        </div>
        
        <div className="flex gap-2">
          <BankStatementImport />
          <TransactionForm
            accounts={accounts}
            categories={categories}
            loading={loading}
            onCreateTransaction={handleCreateTransaction}
          />
        </div>
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
            <TransactionForm
              accounts={accounts}
              categories={categories}
              loading={loading}
              onCreateTransaction={handleCreateTransaction}
            />
          </CardContent>
        </Card>
      ) : (
        <TransactionTable
          transactions={transactions}
          categories={categories}
          loading={loading}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onApplyCategorization={handleApplyCategorization}
        />
      )}
      
      {/* Gestion des catégories */}
      <CategoryManagement 
        categories={categories}
        onCategoryCreated={fetchCategories}
      />
      
      {/* Configuration des règles de catégorisation automatique */}
      <AutoCategorizationRules 
        categories={categories}
        fetchCategories={fetchCategories}
        onRulesUpdate={() => {
          // Optionnel: rafraîchir les données si nécessaire
        }}
      />
    </div>
  );
}