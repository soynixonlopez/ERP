-- Paquetes (ticket_types) alineados con src/features/events/data.ts
-- Evento principal (seed): 22222222-2222-2222-2222-222222222222
-- Segundo evento para la web: 44444444-4444-4444-4444-444444444444

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
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'EPR Business Summit',
  'epr-business-summit',
  'Networking, charlas y workshops para lideres empresariales.',
  'Centro de Convenciones Atlapa',
  timezone('utc', now()) + interval '30 days',
  timezone('utc', now()) + interval '30 days 9 hours',
  'published'
)
on conflict (id) do nothing;

insert into public.ticket_types (
  id,
  organization_id,
  event_id,
  name,
  description,
  badge_label,
  price,
  currency,
  inventory,
  sold,
  visibility,
  is_active
)
values
  (
    '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f01',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Experiencia VIP Backstage',
    'Fila rapida, open bar premium, zona backstage',
    'VIP',
    180.00,
    'USD',
    300,
    120,
    'public',
    true
  ),
  (
    '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f02',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Entrada General',
    'Acceso general, zona food court',
    'GENERAL',
    55.00,
    'USD',
    3000,
    1450,
    'public',
    true
  ),
  (
    '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f03',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Pase Platino',
    'Acceso premium, zona lounge',
    'PLATINO',
    99.00,
    'USD',
    600,
    120,
    'public',
    true
  ),
  (
    '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f04',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'Pase Platino',
    'Lunch ejecutivo, meet & greet speakers',
    'PLATINO',
    240.00,
    'USD',
    120,
    34,
    'public',
    true
  )
on conflict (id) do nothing;
