
-- Mettre à jour l'utilisateur tresorier@asaguadeloupe.fr pour qu'il soit admin
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'tresorier@asaguadeloupe.fr'
);
