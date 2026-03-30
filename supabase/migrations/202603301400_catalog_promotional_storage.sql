-- Requiere migración previa 202603301350_event_status_upcoming.sql (valor enum `upcoming`).
drop policy if exists events_public_read on public.events;

create policy events_public_read on public.events
for select using (status in ('published', 'upcoming', 'sold_out'));

-- Imagen promocional por paquete (tarjetas / detalle)
alter table public.ticket_types
  add column if not exists promotional_image_url text;

-- Bucket público para imágenes subidas desde el panel admin
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'promotional',
  'promotional',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do nothing;

drop policy if exists promotional_public_read on storage.objects;
drop policy if exists promotional_org_staff_insert on storage.objects;
drop policy if exists promotional_org_staff_update on storage.objects;
drop policy if exists promotional_org_staff_delete on storage.objects;

create policy promotional_public_read on storage.objects
for select using (bucket_id = 'promotional');

create policy promotional_org_staff_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'promotional'
  and exists (
    select 1
    from public.organization_members om
    where om.user_id = auth.uid()
      and om.role::text in ('owner', 'admin', 'staff')
      and om.organization_id::text = split_part(name, '/', 1)
  )
);

create policy promotional_org_staff_update on storage.objects
for update to authenticated
using (
  bucket_id = 'promotional'
  and exists (
    select 1
    from public.organization_members om
    where om.user_id = auth.uid()
      and om.role::text in ('owner', 'admin', 'staff')
      and om.organization_id::text = split_part(name, '/', 1)
  )
)
with check (
  bucket_id = 'promotional'
  and exists (
    select 1
    from public.organization_members om
    where om.user_id = auth.uid()
      and om.role::text in ('owner', 'admin', 'staff')
      and om.organization_id::text = split_part(name, '/', 1)
  )
);

create policy promotional_org_staff_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'promotional'
  and exists (
    select 1
    from public.organization_members om
    where om.user_id = auth.uid()
      and om.role::text in ('owner', 'admin', 'staff')
      and om.organization_id::text = split_part(name, '/', 1)
  )
);
