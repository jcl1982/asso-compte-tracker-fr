-- Update RLS policies for transactions to restrict access to admins only

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and treasurers can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Public can view transactions" ON public.transactions;

-- Create new policy for admin-only access
CREATE POLICY "Only admins can access transactions"
ON public.transactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);