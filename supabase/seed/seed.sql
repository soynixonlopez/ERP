insert into public.organizations (id, name, slug, legal_name, email, phone)
values
  ('11111111-1111-1111-1111-111111111111', 'EPR S.A.', 'epr', 'EPR S.A.', 'soporte@epr.com', '+50760000000')
on conflict (id) do nothing;

insert into public.events (
  id,
  organization_id,
  title,
  slug,
  description,
  location,
  starts_at,
  ends_at,
  status
)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Evento Base Seed',
  'evento-base-seed',
  'Evento inicial para pruebas de CRUD admin.',
  'Ciudad de Panama',
  timezone('utc', now()) + interval '7 days',
  timezone('utc', now()) + interval '7 days 4 hours',
  'published'
)
on conflict (id) do nothing;
