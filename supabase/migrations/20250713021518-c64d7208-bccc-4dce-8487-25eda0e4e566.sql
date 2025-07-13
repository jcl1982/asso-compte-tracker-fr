-- Créer une table pour les règles de catégorisation automatique
CREATE TABLE public.categorization_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.categorization_rules ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Categorization rules are viewable by authenticated users" 
ON public.categorization_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Categorization rules can be managed by admins and treasurers" 
ON public.categorization_rules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'treasurer')
));

-- Ajouter le trigger pour updated_at
CREATE TRIGGER update_categorization_rules_updated_at
BEFORE UPDATE ON public.categorization_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX idx_categorization_rules_type ON public.categorization_rules(transaction_type);
CREATE INDEX idx_categorization_rules_priority ON public.categorization_rules(priority DESC);