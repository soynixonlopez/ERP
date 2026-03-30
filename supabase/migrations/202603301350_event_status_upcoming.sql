-- Debe ir en migración aparte: PG no permite usar un valor de enum nuevo
-- en la misma transacción en que se añade (55P04).
alter type public.event_status add value if not exists 'upcoming';
