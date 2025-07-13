-- Mettre à jour l'utilisateur j.cleonis1982@gmail.com pour qu'il soit trésorier
UPDATE public.profiles 
SET role = 'treasurer', updated_at = now()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'j.cleonis1982@gmail.com'
);