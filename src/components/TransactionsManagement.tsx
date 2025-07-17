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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Transactions</h2>
          <p className="text-muted-foreground">
            {isAdmin ? "Enregistrez et suivez toutes vos recettes et dépenses" : "Consultez les transactions enregistrées"}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <BankStatementImport />
            <TransactionForm
              accounts={accounts}
              categories={categories}
              loading={loading}
              onCreateTransaction={handleCreateTransaction}
            />
          </div>
        )}
      </div>

      {!isAdmin && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="flex items-center gap-3 p-4">
            <Shield className="h-5 w-5 text-amber-600" />
            <p className="text-amber-800 dark:text-amber-200">
              Vous consultez les transactions en mode lecture seule. Seuls les administrateurs peuvent saisir de nouvelles transactions.
            </p>
          </CardContent>
        </Card>
      )}

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
              {isAdmin ? "Commencez par enregistrer votre première transaction" : "Aucune transaction disponible pour le moment"}
            </p>
            {isAdmin && (
              <TransactionForm
                accounts={accounts}
                categories={categories}
                loading={loading}
                onCreateTransaction={handleCreateTransaction}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <TransactionTable
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          loading={loading}
          onDeleteTransaction={isAdmin ? handleDeleteTransaction : undefined}
          onUpdateTransaction={isAdmin ? handleUpdateTransaction : undefined}
          onApplyCategorization={isAdmin ? handleApplyCategorization : undefined}
        />
      )}
      
      {/* Gestion des catégories - Seulement pour les admins */}
      {isAdmin && (
        <>
          <CategoryManagement 
            categories={categories}
            onCategoryCreated={fetchCategories}
          />
          
          <AutoCategorizationRules 
            categories={categories}
            fetchCategories={fetchCategories}
            onRulesUpdate={() => {
              // Optionnel: rafraîchir les données si nécessaire
            }}
          />
        </>
      )}
    </div>
  );
}