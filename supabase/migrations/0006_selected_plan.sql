alter table public.eventos
  add column if not exists selected_plan text;

comment on column public.eventos.selected_plan is 'Plano desejado pelo cliente para orientar geracao e publicacao do site.';
