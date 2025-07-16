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
  'cfab5cf0-72c9-45a3-85a8-61c9d3d714d5',
  '2024-12-31 23:59:59+00',
  '2024-12-31 23:59:59+00'
);