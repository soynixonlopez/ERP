-- Adjust reservation creation for public customers and manual-payment flow

drop policy if exists reservations_insert_user on public.reservations;

create policy reservations_insert_user on public.reservations
for insert
with check (user_id = auth.uid());

create or replace function public.create_reservation(
  p_organization_id uuid,
  p_user_id uuid,
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity integer,
  p_buyer_name text,
  p_buyer_email text,
  p_buyer_phone text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.ticket_types%rowtype;
  v_event public.events%rowtype;
  v_reservation_id uuid;
  v_reservation_number text;
  v_total numeric(12,2);
begin
  if p_quantity < 1 then
    raise exception 'quantity must be at least 1';
  end if;

  select *
  into v_event
  from public.events
  where id = p_event_id
    and organization_id = p_organization_id
    and status = 'published';

  if not found then
    raise exception 'event is not available';
  end if;

  select *
  into v_ticket
  from public.ticket_types
  where id = p_ticket_type_id
    and organization_id = p_organization_id
    and event_id = p_event_id
    and is_active = true
  for update;

  if not found then
    raise exception 'ticket type not found or inactive';
  end if;

  if (v_ticket.sold + p_quantity) > v_ticket.inventory then
    raise exception 'not enough inventory';
  end if;

  v_total := v_ticket.price * p_quantity;
  v_reservation_number := 'RSV-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random() * 1000000))::text, 6, '0');

  insert into public.reservations (
    organization_id,
    user_id,
    event_id,
    reservation_number,
    status,
    payment_status,
    buyer_name,
    buyer_email,
    buyer_phone,
    subtotal,
    total,
    expires_at
  )
  values (
    p_organization_id,
    p_user_id,
    p_event_id,
    v_reservation_number,
    'pending_payment',
    'pending',
    p_buyer_name,
    p_buyer_email,
    p_buyer_phone,
    v_total,
    v_total,
    timezone('utc', now()) + interval '12 hours'
  )
  returning id into v_reservation_id;

  insert into public.reservation_items (
    organization_id,
    reservation_id,
    event_id,
    ticket_type_id,
    quantity,
    unit_price,
    line_total
  )
  values (
    p_organization_id,
    v_reservation_id,
    p_event_id,
    p_ticket_type_id,
    p_quantity,
    v_ticket.price,
    v_total
  );

  update public.ticket_types
  set sold = sold + p_quantity
  where id = p_ticket_type_id
    and organization_id = p_organization_id;

  insert into public.attendees (
    organization_id,
    reservation_id,
    full_name,
    email,
    phone
  )
  values (
    p_organization_id,
    v_reservation_id,
    p_buyer_name,
    p_buyer_email,
    p_buyer_phone
  );

  return jsonb_build_object(
    'reservation_id', v_reservation_id,
    'reservation_number', v_reservation_number,
    'total', v_total
  );
end;
$$;
