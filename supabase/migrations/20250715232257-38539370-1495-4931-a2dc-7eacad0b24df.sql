-- Update RLS policies for accounts to restrict access to admins only

-- Drop existing policies for accounts
DROP POLICY IF EXISTS "Admins and treasurers can manage accounts" ON public.accounts;
DROP POLICY IF EXISTS "Public can view accounts" ON public.accounts;

-- Create new policy for admin-only access to accounts
CREATE POLICY "Only admins can access accounts"
ON public.accounts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);