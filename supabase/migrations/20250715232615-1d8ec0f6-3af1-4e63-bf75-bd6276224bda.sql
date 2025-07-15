-- Allow all authenticated users to view transactions and accounts for reports
-- while keeping admin-only access for modifications

-- Update policies for transactions
DROP POLICY IF EXISTS "Only admins can access transactions" ON public.transactions;

-- Allow all authenticated users to view transactions
CREATE POLICY "All users can view transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can create, update, delete transactions
CREATE POLICY "Only admins can manage transactions"
ON public.transactions
FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Update policies for accounts
DROP POLICY IF EXISTS "Only admins can access accounts" ON public.accounts;

-- Allow all authenticated users to view accounts
CREATE POLICY "All users can view accounts"
ON public.accounts
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can create, update, delete accounts
CREATE POLICY "Only admins can manage accounts"
ON public.accounts
FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);