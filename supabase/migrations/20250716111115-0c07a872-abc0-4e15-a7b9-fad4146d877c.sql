-- Ajouter un compte bancaire principal avec le solde au 31 décembre 2024
INSERT INTO public.accounts (
  name,
  type,
  balance,
  user_id,
  created_at,
  updated_at
) VALUES (
  'Compte Principal - Solde au 31/12/2024',
  'bank',
  2585.21,
  'd13068d8-b27a-4243-a459-2ef09dd6c89c',
  '2024-12-31 23:59:59+00',
  '2024-12-31 23:59:59+00'
);