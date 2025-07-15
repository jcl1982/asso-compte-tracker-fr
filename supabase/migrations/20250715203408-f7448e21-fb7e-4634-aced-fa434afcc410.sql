-- Modifier les politiques RLS pour permettre la visualisation publique des rapports

-- Supprimer les anciennes politiques restrictives et créer des politiques publiques pour la lecture
DROP POLICY IF EXISTS "Users can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Categories are viewable by authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Categorization rules are viewable by authenticated users" ON public.categorization_rules;

-- Créer des politiques publiques pour la lecture des comptes
CREATE POLICY "Public can view accounts" 
ON public.accounts 
FOR SELECT 
USING (true);

-- Créer des politiques publiques pour la lecture des transactions
CREATE POLICY "Public can view transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

-- Créer des politiques publiques pour la lecture des catégories
CREATE POLICY "Public can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

-- Créer des politiques publiques pour la lecture des règles de catégorisation
CREATE POLICY "Public can view categorization rules" 
ON public.categorization_rules 
FOR SELECT 
USING (true);

-- Conserver les politiques de gestion pour les admins et trésoriers
-- (Les politiques ALL existantes pour les admins/trésoriers restent en place)