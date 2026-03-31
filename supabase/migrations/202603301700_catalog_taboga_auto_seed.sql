-- Catálogo Taboga en un solo script: bucket (tamaño), evento principal y paquetes con imagen promocional.
-- Requiere migración previa 202603301400 (bucket promotional) y org 11111111… (seed / datos base).

-- 1) Límite de subida del bucket (alineado con next.config ~25 MB)
update storage.buckets
set file_size_limit = 26214400
where id = 'promotional';

-- 2) Evento fijo 2222… (mismos UUID que paquetes en 202603260001 / admin)
insert into public.events (
  id,
  organization_id,
  title,
  slug,
  description,
  short_description,
  location,
  cover_image_url,
  starts_at,
  ends_at,
  status,
  metadata
)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'VALLENATO Y SALSA EN TABOGA',
  'vallenato-y-salsa-en-taboga',
  $d$
Escápate a Taboga y disfruta un día de música en vivo, playa y buena energía. Incluye desayuno, acceso al evento, zonas frente al mar y una experiencia pensada para relajarte y disfrutar al máximo.

Fechas: 4 y 5 de abril de 2026.
Salida: 9:00 AM (hora de Panamá).

Vive una experiencia única en Taboga combinando lo mejor de la música y el descanso. Este evento de vallenato y salsa te invita a desconectarte de la rutina y sumergirte en un ambiente lleno de alegría, playa y buena energía.

Desde temprano, saldrás hacia la isla para disfrutar de un día completo que incluye desayuno, acceso al evento y espacios frente al mar diseñados para tu comodidad. Déjate llevar por el ritmo en vivo, relájate con la brisa del mar y comparte momentos inolvidables en un entorno paradisíaco.

Ideal para ir con amigos, pareja o incluso solo, este plan está pensado para quienes buscan diversión, descanso y una experiencia diferente en uno de los destinos más bonitos de Panamá.
$d$,
  'Disfruta un escape perfecto a Taboga con música en vivo, playa y buena vibra. Un día lleno de vallenato, salsa y energía frente al mar que no te puedes perder.',
  'Isla Perico, Calzada de Amador (al lado de la Base Aeronaval)',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  timestamptz '2026-04-04 14:00:00+00',
  timestamptz '2026-04-05 23:00:00+00',
  'published',
  '{}'::jsonb
)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  short_description = excluded.short_description,
  location = excluded.location,
  cover_image_url = excluded.cover_image_url,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  updated_at = timezone('utc', now());

-- 3) Ocultar paquetes placeholder del seed 202603260001 para este evento
update public.ticket_types
set
  is_active = false,
  visibility = 'hidden',
  updated_at = timezone('utc', now())
where event_id = '22222222-2222-2222-2222-222222222222'
  and id in (
    '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f01',
    '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f02',
    '3f3f3f3f-3f3f-3f3f-3f3f-3f3f3f3f3f03'
  );

-- 4) Paquetes Taboga (imagen en /public)
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
  is_active,
  sort_order,
  promotional_image_url
)
values
  (
    'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b201',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Paquete 1 – Platino Crucero',
    'Transporte ida y vuelta en el crucero Majestic + silla + sombrilla en la playa + acceso Platino al evento (opción de subir a VIP por $10 adicionales)',
    'PLATINO',
    75.00,
    'USD',
    120,
    0,
    'public',
    true,
    1,
    '/assets/imagenes/taboga2026.png'
  ),
  (
    'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b202',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Paquete 2 – VIP Crucero',
    'Transporte ida y vuelta en el crucero Majestic + silla + sombrilla en la playa + almuerzo + souvenirs + acceso VIP al evento',
    'VIP',
    99.00,
    'USD',
    120,
    0,
    'public',
    true,
    2,
    '/assets/imagenes/taboga2026.png'
  ),
  (
    'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b203',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Localidad VIP (solo evento)',
    'Acceso a zona VIP del evento (sin transporte)',
    'VIP',
    35.00,
    'USD',
    500,
    0,
    'public',
    true,
    3,
    '/assets/imagenes/taboga2026.png'
  ),
  (
    'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b204',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Palco Platino (solo evento)',
    'Acceso a zona Platino del evento (sin transporte)',
    'PLATINO',
    25.00,
    'USD',
    600,
    0,
    'public',
    true,
    4,
    '/assets/imagenes/taboga2026.png'
  ),
  (
    'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b205',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'General (solo evento)',
    'Acceso a zona general del evento (sin transporte)',
    'GENERAL',
    15.00,
    'USD',
    3000,
    0,
    'public',
    true,
    5,
    '/assets/imagenes/taboga2026.png'
  )
on conflict (id) do update set
  organization_id = excluded.organization_id,
  event_id = excluded.event_id,
  name = excluded.name,
  description = excluded.description,
  badge_label = excluded.badge_label,
  price = excluded.price,
  currency = excluded.currency,
  inventory = excluded.inventory,
  visibility = excluded.visibility,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  promotional_image_url = excluded.promotional_image_url,
  updated_at = timezone('utc', now());
