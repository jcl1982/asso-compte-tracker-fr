-- Modifier le nom de la catégorie Événements en Engagements
UPDATE public.categories 
SET name = 'Engagements', updated_at = now()
WHERE name = 'Événements';