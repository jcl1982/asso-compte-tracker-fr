-- Créer des règles de catégorisation automatique pour les mots-clés courants

-- D'abord, récupérer les IDs des catégories pour les utiliser dans les règles
-- Règles pour les revenus
INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['cotisation', 'adhésion', 'membre'], 'income', 1 FROM categories WHERE name = 'Cotisations' AND type = 'income';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['don', 'donation', 'générosité'], 'income', 1 FROM categories WHERE name = 'Dons' AND type = 'income';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['subvention', 'aide publique', 'mairie', 'conseil', 'région'], 'income', 1 FROM categories WHERE name = 'Subventions publiques' AND type = 'income';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['vente', 'boutique', 'marchandise', 'produit'], 'income', 1 FROM categories WHERE name = 'Ventes' AND type = 'income';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['remboursement', 'remb', 'retour', 'avoir'], 'income', 1 FROM categories WHERE name = 'Remboursements' AND type = 'income';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['intérêt', 'livret', 'épargne', 'placement'], 'income', 1 FROM categories WHERE name = 'Intérêts bancaires' AND type = 'income';

-- Règles pour les dépenses
INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['assurance', 'muac', 'mutuelle', 'responsabilité civile'], 'expense', 1 FROM categories WHERE name = 'Assurance' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['ordinateur', 'informatique', 'logiciel', 'matériel'], 'expense', 1 FROM categories WHERE name = 'Matériel informatique' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['maintenance', 'réparation', 'entretien', 'dépannage'], 'expense', 1 FROM categories WHERE name = 'Maintenance' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['électricité', 'eau', 'gaz', 'edf', 'engie'], 'expense', 1 FROM categories WHERE name = 'Utilités (électricité, eau)' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['location', 'loyer', 'bail'], 'expense', 1 FROM categories WHERE name = 'Location de matériel' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['avocat', 'notaire', 'comptable', 'expert', 'conseil'], 'expense', 1 FROM categories WHERE name = 'Honoraires professionnels' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['frais bancaire', 'commission', 'agios', 'carte'], 'expense', 1 FROM categories WHERE name = 'Frais bancaires' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['formation', 'stage', 'séminaire', 'cours'], 'expense', 1 FROM categories WHERE name = 'Formation' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['fourniture', 'bureau', 'papier', 'stylo', 'classeur'], 'expense', 1 FROM categories WHERE name = 'Fournitures bureau' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['déplacement', 'train', 'avion', 'taxi', 'uber'], 'expense', 1 FROM categories WHERE name = 'Déplacements' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['essence', 'diesel', 'carburant', 'station'], 'expense', 1 FROM categories WHERE name = 'Carburant' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['métro', 'bus', 'tramway', 'navigo'], 'expense', 1 FROM categories WHERE name = 'Transport en commun' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['hôtel', 'hébergement', 'gîte', 'airbnb'], 'expense', 1 FROM categories WHERE name = 'Hébergement' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['restaurant', 'repas', 'déjeuner', 'dîner'], 'expense', 1 FROM categories WHERE name = 'Restauration' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['nourriture', 'courses', 'supermarché', 'alimentation'], 'expense', 1 FROM categories WHERE name = 'Achats de nourriture' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['communication', 'téléphone', 'internet', 'orange', 'sfr'], 'expense', 1 FROM categories WHERE name = 'Communication' AND type = 'expense';

INSERT INTO public.categorization_rules (category_id, keywords, transaction_type, priority) 
SELECT id, ARRAY['événement', 'manifestation', 'fête', 'soirée'], 'expense', 1 FROM categories WHERE name = 'Événements' AND type = 'expense';