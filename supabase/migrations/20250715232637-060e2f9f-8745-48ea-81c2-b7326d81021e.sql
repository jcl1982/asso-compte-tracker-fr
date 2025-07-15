-- Allow all authenticated users to view transactions and accounts for reports
-- while keeping admin-only access for modifications

-- Update policies for transactions
DROP POLICY IF EXISTS "Only admins can access transactions" ON public.transactions;

-- Allow all authenticated users to view transactions
CREATE POLICY "All users can view transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can insert transactions
CREATE POLICY "Only admins can insert transactions"
ON public.transactions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Only admins can update transactions
CREATE POLICY "Only admins can update transactions"
ON public.transactions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete transactions
CREATE POLICY "Only admins can delete transactions"
ON public.transactions
FOR DELETE
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

-- Only admins can insert accounts
CREATE POLICY "Only admins can insert accounts"
ON public.accounts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Only admins can update accounts
CREATE POLICY "Only admins can update accounts"
ON public.accounts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete accounts
CREATE POLICY "Only admins can delete accounts"
ON public.accounts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);