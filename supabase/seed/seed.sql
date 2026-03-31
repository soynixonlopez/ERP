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
  short_description,
  location,
  cover_image_url,
  starts_at,
  ends_at,
  status
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
  'published'
)
on conflict (id) do nothing;
