import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface CategorizationRule {
  id: string;
  category_id: string;
  keywords: string[];
  transaction_type: 'income' | 'expense';
  priority: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'grants' | 'dues';
  balance: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id?: string;
  description?: string;
  transaction_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  accounts?: { name: string };
  categories?: { name: string };
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

export function useFinance() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les comptes
  const fetchAccounts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts((data || []) as Account[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les comptes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les transactions
  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts(name),
          categories(name)
        `)
        .order('transaction_date', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les catégories
  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories((data || []) as Category[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive"
      });
    }
  };

  // Créer un compte
  const createAccount = async (accountData: Omit<Account, 'id' | 'balance' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([
          {
            ...accountData,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Compte créé avec succès"
      });

      fetchAccounts();
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte",
        variant: "destructive"
      });
    }
  };

  // Fonction pour auto-catégoriser une transaction
  const autoCategorizTransaction = async (description: string, type: 'income' | 'expense'): Promise<string | undefined> => {
    if (!description) return undefined;

    try {
      const { data: rules, error } = await supabase
        .from('categorization_rules')
        .select('*')
        .eq('transaction_type', type)
        .order('priority', { ascending: false });

      if (error) throw error;

      const lowerDescription = description.toLowerCase();
      
      for (const rule of rules || []) {
        const hasMatch = rule.keywords.some(keyword => 
          lowerDescription.includes(keyword.toLowerCase())
        );
        
        if (hasMatch) {
          return rule.category_id;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la catégorisation automatique:', error);
    }

    return undefined;
  };

  // Créer une transaction
  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'accounts' | 'categories'>) => {
    if (!user) return;

    try {
      // Auto-catégorisation si aucune catégorie n'est spécifiée
      let finalTransactionData = { ...transactionData };
      if (!finalTransactionData.category_id && finalTransactionData.description) {
        const suggestedCategoryId = await autoCategorizTransaction(
          finalTransactionData.description,
          finalTransactionData.type
        );
        if (suggestedCategoryId) {
          finalTransactionData.category_id = suggestedCategoryId;
        }
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...finalTransactionData,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Transaction créée avec succès"
      });

      fetchTransactions();
      fetchAccounts(); // Mettre à jour les soldes
      return data;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la transaction",
        variant: "destructive"
      });
    }
  };

  // Supprimer un compte
  const deleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Compte supprimé avec succès"
      });

      fetchAccounts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le compte",
        variant: "destructive"
      });
    }
  };

  // Modifier une transaction
  const updateTransaction = async (transactionId: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'accounts' | 'categories'>>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Transaction modifiée avec succès"
      });

      fetchTransactions();
      fetchAccounts(); // Mettre à jour les soldes
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la transaction",
        variant: "destructive"
      });
    }
  };

  // Supprimer une transaction
  const deleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Transaction supprimée avec succès"
      });

      fetchTransactions();
      fetchAccounts(); // Mettre à jour les soldes
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la transaction",
        variant: "destructive"
      });
    }
  };

  // Calculer le solde total
  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + Number(account.balance), 0);
  };

  // Calculer les totaux par type
  const getBalanceByType = () => {
    return accounts.reduce((totals, account) => {
      totals[account.type] = (totals[account.type] || 0) + Number(account.balance);
      return totals;
    }, {} as Record<string, number>);
  };

  // Appliquer la catégorisation automatique aux transactions existantes
  const applyCategorization = async (transactionIds?: string[]) => {
    if (!user) return;

    try {
      // Récupérer les règles de catégorisation
      const { data: rules, error: rulesError } = await supabase
        .from('categorization_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (rulesError) throw rulesError;

      // Récupérer les transactions non catégorisées ou spécifiques
      let query = supabase
        .from('transactions')
        .select('id, description, type, category_id');

      if (transactionIds && transactionIds.length > 0) {
        query = query.in('id', transactionIds);
      } else {
        query = query.is('category_id', null);
      }

      const { data: transactions, error: transactionsError } = await query;

      if (transactionsError) throw transactionsError;

      let updatedCount = 0;

      // Appliquer les règles aux transactions
      for (const transaction of transactions || []) {
        if (!transaction.description) continue;

        const applicableRules = rules?.filter(rule => rule.transaction_type === transaction.type) || [];
        const lowerDescription = transaction.description.toLowerCase();
        
        for (const rule of applicableRules) {
          const hasMatch = rule.keywords.some(keyword => 
            lowerDescription.includes(keyword.toLowerCase())
          );
          
          if (hasMatch) {
            const { error: updateError } = await supabase
              .from('transactions')
              .update({ category_id: rule.category_id })
              .eq('id', transaction.id);

            if (!updateError) {
              updatedCount++;
            }
            break; // Utiliser la première règle qui correspond
          }
        }
      }

      if (updatedCount > 0) {
        toast({
          title: "Succès",
          description: `${updatedCount} transaction(s) catégorisée(s) automatiquement`
        });
        fetchTransactions();
      } else {
        toast({
          title: "Information",
          description: "Aucune transaction à catégoriser automatiquement"
        });
      }

      return updatedCount;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'appliquer la catégorisation automatique",
        variant: "destructive"
      });
      return 0;
    }
  };

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchTransactions();
      fetchCategories();
    }
  }, [user]);

  return {
    accounts,
    transactions,
    categories,
    loading,
    createAccount,
    createTransaction,
    updateTransaction,
    deleteAccount,
    deleteTransaction,
    fetchAccounts,
    fetchTransactions,
    fetchCategories, // Exposer fetchCategories pour permettre le rafraîchissement
    getTotalBalance,
    getBalanceByType,
    applyCategorization
  };
}