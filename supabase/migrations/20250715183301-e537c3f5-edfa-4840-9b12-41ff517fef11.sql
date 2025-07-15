-- Ajouter quelques catégories supplémentaires utiles pour les associations

-- Catégories de revenus supplémentaires
INSERT INTO public.categories (name, type) VALUES 
('Vente de marchandises', 'income'),
('Remboursements', 'income'),
('Intérêts bancaires', 'income'),
('Revenus locatifs', 'income')
ON CONFLICT DO NOTHING;

-- Catégories de dépenses supplémentaires  
INSERT INTO public.categories (name, type) VALUES
('Matériel informatique', 'expense'),
('Maintenance', 'expense'),
('Utilités (électricité, eau)', 'expense'),
('Location de matériel', 'expense'),
('Honoraires professionnels', 'expense'),
('Frais de gestion', 'expense'),
('Taxes et impôts', 'expense'),
('Achats de nourriture', 'expense'),
('Transport en commun', 'expense'),
('Carburant', 'expense'),
('Hébergement', 'expense'),
('Restauration', 'expense')
ON CONFLICT DO NOTHING;