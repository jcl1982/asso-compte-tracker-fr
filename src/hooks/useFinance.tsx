import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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
        .limit(100);

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

  // Créer une transaction
  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'accounts' | 'categories'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...transactionData,
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
    deleteAccount,
    deleteTransaction,
    fetchAccounts,
    fetchTransactions,
    getTotalBalance,
    getBalanceByType
  };
}