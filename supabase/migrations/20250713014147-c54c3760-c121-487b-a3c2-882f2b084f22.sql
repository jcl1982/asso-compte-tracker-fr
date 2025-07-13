-- Créer la table des catégories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des comptes
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'grants', 'dues')),
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES public.categories(id),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Politiques pour les catégories (visibles par tous les utilisateurs authentifiés)
CREATE POLICY "Categories are viewable by authenticated users"
ON public.categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Categories can be managed by admins and treasurers"
ON public.categories FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'treasurer')
  )
);

-- Politiques pour les comptes
CREATE POLICY "Users can view all accounts"
ON public.accounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and treasurers can manage accounts"
ON public.accounts FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'treasurer')
  )
);

-- Politiques pour les transactions
CREATE POLICY "Users can view all transactions"
ON public.transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and treasurers can manage transactions"
ON public.transactions FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'treasurer')
  )
);

-- Triggers pour les timestamps
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer des catégories par défaut
INSERT INTO public.categories (name, type) VALUES
-- Revenus
('Cotisations', 'income'),
('Subventions publiques', 'income'),
('Dons', 'income'),
('Événements', 'income'),
('Ventes', 'income'),
-- Dépenses
('Fournitures bureau', 'expense'),
('Frais bancaires', 'expense'),
('Assurance', 'expense'),
('Événements', 'expense'),
('Formation', 'expense'),
('Communication', 'expense'),
('Déplacements', 'expense'),
('Autres', 'expense');

-- Fonction pour mettre à jour le solde d'un compte
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le solde lors de l'ajout d'une transaction
  IF TG_OP = 'INSERT' THEN
    UPDATE public.accounts 
    SET balance = balance + 
      CASE 
        WHEN NEW.type = 'income' THEN NEW.amount
        WHEN NEW.type = 'expense' THEN -NEW.amount
      END,
      updated_at = now()
    WHERE id = NEW.account_id;
    RETURN NEW;
  END IF;
  
  -- Mettre à jour le solde lors de la modification d'une transaction
  IF TG_OP = 'UPDATE' THEN
    -- Annuler l'ancienne transaction
    UPDATE public.accounts 
    SET balance = balance - 
      CASE 
        WHEN OLD.type = 'income' THEN OLD.amount
        WHEN OLD.type = 'expense' THEN -OLD.amount
      END,
      updated_at = now()
    WHERE id = OLD.account_id;
    
    -- Appliquer la nouvelle transaction
    UPDATE public.accounts 
    SET balance = balance + 
      CASE 
        WHEN NEW.type = 'income' THEN NEW.amount
        WHEN NEW.type = 'expense' THEN -NEW.amount
      END,
      updated_at = now()
    WHERE id = NEW.account_id;
    RETURN NEW;
  END IF;
  
  -- Mettre à jour le solde lors de la suppression d'une transaction
  IF TG_OP = 'DELETE' THEN
    UPDATE public.accounts 
    SET balance = balance - 
      CASE 
        WHEN OLD.type = 'income' THEN OLD.amount
        WHEN OLD.type = 'expense' THEN -OLD.amount
      END,
      updated_at = now()
    WHERE id = OLD.account_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le solde des comptes
CREATE TRIGGER update_account_balance_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();