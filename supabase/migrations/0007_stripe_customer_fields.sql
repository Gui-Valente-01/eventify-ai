alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text;

create index if not exists profiles_stripe_customer_idx
  on public.profiles (stripe_customer_id);

comment on column public.profiles.stripe_customer_id is 'ID do cliente na Stripe para abrir portal de assinatura.';
comment on column public.profiles.stripe_subscription_id is 'ID da assinatura ativa/mais recente na Stripe.';
comment on column public.profiles.subscription_status is 'Status da assinatura Stripe.';
