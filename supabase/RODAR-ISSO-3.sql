-- =============================================================
-- Eventify AI — Parte 3: Fix recursão infinita nas RLS de admin
-- =============================================================
-- Problema: a policy "profiles_admin_read" lia public.profiles
-- dentro do próprio profiles → recursão infinita (erro 42P17).
-- Solução: usar SECURITY DEFINER function que bypassa RLS.
-- =============================================================

-- Função helper que checa is_admin sem disparar policies
create or replace function public.is_user_admin(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = check_user_id limit 1),
    false
  )
$$;

-- Substitui todas as policies admin pra usar a função
drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select using (public.is_user_admin(auth.uid()));

drop policy if exists "eventos_admin_read" on public.eventos;
create policy "eventos_admin_read" on public.eventos
  for select using (public.is_user_admin(auth.uid()));

drop policy if exists "convidados_admin_read" on public.convidados;
create policy "convidados_admin_read" on public.convidados
  for select using (public.is_user_admin(auth.uid()));

drop policy if exists "usage_logs_admin_read" on public.usage_logs;
create policy "usage_logs_admin_read" on public.usage_logs
  for select using (public.is_user_admin(auth.uid()));

-- =============================================================
-- Pronto. Recarrega o app e a recursão some.
-- =============================================================
