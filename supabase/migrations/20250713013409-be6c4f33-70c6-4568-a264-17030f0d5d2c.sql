-- Modifier la contrainte pour inclure le rôle admin
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('member', 'treasurer', 'president', 'board', 'admin'));

-- Mettre à jour l'utilisateur j.cleonis1982@gmail.com pour qu'il soit admin
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'j.cleonis1982@gmail.com'
);