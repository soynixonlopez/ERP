-- País y edad del comprador; varios asistentes por reserva (titular + invitados).
-- Preview de check-in (sin insertar) + enriquecimiento de respuestas gate con grupo y datos del comprador.

alter table public.reservations
  add column if not exists buyer_country text,
  add column if not exists buyer_age smallint;

alter table public.reservations
  drop constraint if exists reservations_buyer_age_reasonable;

alter table public.reservations
  add constraint reservations_buyer_age_reasonable
  check (buyer_age is null or (buyer_age >= 1 and buyer_age <= 120));

drop function if exists public.create_reservation(uuid, uuid, uuid, uuid, integer, text, text, text);

create or replace function public.create_reservation(
  p_organization_id uuid,
  p_user_id uuid,
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity integer,
  p_buyer_name text,
  p_buyer_email text,
  p_buyer_phone text default null,
  p_buyer_country text default null,
  p_buyer_age integer default null,
  p_guest_names text[] default null
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
  v_qr text;
  v_guests text[];
  v_i integer;
  v_guest_count int;
  v_name text;
begin
  if p_quantity < 1 then
    raise exception 'quantity must be at least 1';
  end if;

  if p_buyer_country is null or length(trim(both from p_buyer_country)) < 2 then
    raise exception 'buyer country required';
  end if;

  if p_buyer_age is null or p_buyer_age < 1 or p_buyer_age > 120 then
    raise exception 'buyer age invalid';
  end if;

  v_guests := coalesce(p_guest_names, array[]::text[]);
  v_guest_count := coalesce(cardinality(v_guests), 0);

  if p_quantity = 1 and v_guest_count <> 0 then
    raise exception 'guest names not allowed for single ticket';
  end if;

  if p_quantity > 1 and v_guest_count <> (p_quantity - 1) then
    raise exception 'guest names count must match quantity minus one';
  end if;

  for v_i in 1..v_guest_count loop
    v_name := trim(both from v_guests[v_i]);
    if length(v_name) < 2 or length(v_name) > 120 then
      raise exception 'invalid guest name';
    end if;
    v_guests[v_i] := v_name;
  end loop;

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
    buyer_country,
    buyer_age,
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
    trim(both from p_buyer_name),
    trim(both from p_buyer_email),
    nullif(trim(both from coalesce(p_buyer_phone, '')), ''),
    trim(both from p_buyer_country),
    p_buyer_age::smallint,
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

  -- Titular + invitados: un QR único por asistente
  v_qr := 'EPR-' || replace(gen_random_uuid()::text, '-', '');
  insert into public.attendees (
    organization_id,
    reservation_id,
    full_name,
    email,
    phone,
    qr_code
  )
  values (
    p_organization_id,
    v_reservation_id,
    trim(both from p_buyer_name),
    trim(both from p_buyer_email),
    nullif(trim(both from coalesce(p_buyer_phone, '')), ''),
    v_qr
  );

  for v_i in 1..v_guest_count loop
    v_qr := 'EPR-' || replace(gen_random_uuid()::text, '-', '');
    insert into public.attendees (
      organization_id,
      reservation_id,
      full_name,
      email,
      phone,
      qr_code
    )
    values (
      p_organization_id,
      v_reservation_id,
      v_guests[v_i],
      null,
      null,
      v_qr
    );
  end loop;

  return jsonb_build_object(
    'reservation_id', v_reservation_id,
    'reservation_number', v_reservation_number,
    'total', v_total
  );
end;
$$;

grant execute on function public.create_reservation(
  uuid, uuid, uuid, uuid, integer, text, text, text, text, integer, text[]
) to authenticated;

-- Helpers en gate: datos de grupo y comprador
create or replace function public.gate_register_checkin_by_qr(
  p_organization_id uuid,
  p_event_id uuid,
  p_qr_token text,
  p_scanned_by uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_attendee_id uuid;
  v_reservation_id uuid;
  v_full_name text;
  v_email text;
  v_reservation_number text;
  v_res_status public.reservation_status;
  v_pay_status public.payment_status;
  v_package_names text;
  v_checked_in_at timestamptz;
  v_party_names text[];
  v_buyer_country text;
  v_buyer_age int;
begin
  v_token := nullif(trim(both from p_qr_token), '');
  if v_token is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'INVALID_TOKEN',
      'message', 'Codigo vacio o invalido'
    );
  end if;

  select
    a.id,
    a.full_name,
    a.email,
    r.id,
    r.reservation_number,
    r.status,
    r.payment_status,
    r.buyer_country,
    r.buyer_age
  into
    v_attendee_id,
    v_full_name,
    v_email,
    v_reservation_id,
    v_reservation_number,
    v_res_status,
    v_pay_status,
    v_buyer_country,
    v_buyer_age
  from public.attendees a
  join public.reservations r on r.id = a.reservation_id
  where a.organization_id = p_organization_id
    and r.event_id = p_event_id
    and a.qr_code = v_token
  limit 1;

  if v_attendee_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_FOUND',
      'message', 'QR no valido para este evento'
    );
  end if;

  select coalesce(array_agg(a.full_name order by a.created_at), array[]::text[])
  into v_party_names
  from public.attendees a
  where a.reservation_id = v_reservation_id;

  select coalesce(string_agg(distinct tt.name, ', '), 'Paquete')
  into v_package_names
  from public.reservation_items ri
  join public.ticket_types tt on tt.id = ri.ticket_type_id
  where ri.reservation_id = v_reservation_id;

  if v_res_status is distinct from 'confirmed'::public.reservation_status
     or v_pay_status is distinct from 'paid'::public.payment_status then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_CONFIRMED',
      'message', 'La reserva no esta confirmada o el pago no figura como pagado',
      'attendee', jsonb_build_object(
        'fullName', v_full_name,
        'email', v_email,
        'reservationNumber', v_reservation_number,
        'reservationStatus', v_res_status::text,
        'paymentStatus', v_pay_status::text,
        'packageName', v_package_names
      ),
      'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
      'buyerCountry', v_buyer_country,
      'buyerAge', v_buyer_age
    );
  end if;

  begin
    insert into public.checkins (
      organization_id,
      attendee_id,
      event_id,
      session_id,
      scanned_by
    )
    values (
      p_organization_id,
      v_attendee_id,
      p_event_id,
      null,
      p_scanned_by
    )
    returning checked_in_at into v_checked_in_at;

    return jsonb_build_object(
      'ok', true,
      'code', 'CHECKED_IN',
      'message', 'Ingreso registrado',
      'checkedInAt', v_checked_in_at,
      'attendee', jsonb_build_object(
        'id', v_attendee_id,
        'fullName', v_full_name,
        'email', v_email,
        'reservationNumber', v_reservation_number,
        'packageName', v_package_names
      ),
      'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
      'buyerCountry', v_buyer_country,
      'buyerAge', v_buyer_age
    );
  exception
    when unique_violation then
      select c.checked_in_at
      into v_checked_in_at
      from public.checkins c
      where c.organization_id = p_organization_id
        and c.attendee_id = v_attendee_id
        and c.event_id = p_event_id
        and c.session_id is null
      limit 1;

      return jsonb_build_object(
        'ok', true,
        'code', 'ALREADY_CHECKED_IN',
        'message', 'Esta persona ya registro ingreso',
        'checkedInAt', v_checked_in_at,
        'attendee', jsonb_build_object(
          'id', v_attendee_id,
          'fullName', v_full_name,
          'email', v_email,
          'reservationNumber', v_reservation_number,
          'packageName', v_package_names
        ),
        'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
        'buyerCountry', v_buyer_country,
        'buyerAge', v_buyer_age
      );
  end;
end;
$$;

create or replace function public.gate_register_checkin_by_reservation_suffix(
  p_organization_id uuid,
  p_event_id uuid,
  p_suffix text,
  p_scanned_by uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_suffix text;
  v_match_count int;
  v_attendee_id uuid;
  v_reservation_id uuid;
  v_full_name text;
  v_email text;
  v_reservation_number text;
  v_res_status public.reservation_status;
  v_pay_status public.payment_status;
  v_package_names text;
  v_checked_in_at timestamptz;
  v_party_names text[];
  v_buyer_country text;
  v_buyer_age int;
begin
  v_suffix := regexp_replace(coalesce(p_suffix, ''), '[^0-9]', '', 'g');
  if length(v_suffix) < 6 then
    return jsonb_build_object(
      'ok', false,
      'code', 'INVALID_SUFFIX',
      'message', 'Indique 6 digitos del numero de reserva'
    );
  end if;
  v_suffix := right(v_suffix, 6);

  select count(*)::int
  into v_match_count
  from public.attendees a
  join public.reservations r on r.id = a.reservation_id
  where a.organization_id = p_organization_id
    and r.event_id = p_event_id
    and right(regexp_replace(r.reservation_number, '[^0-9]', '', 'g'), 6) = v_suffix;

  if v_match_count = 0 then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_FOUND',
      'message', 'Codigo no valido para este evento'
    );
  end if;

  if v_match_count > 1 then
    return jsonb_build_object(
      'ok', false,
      'code', 'AMBIGUOUS',
      'message', 'Varios asistentes coinciden; use el codigo QR del titular'
    );
  end if;

  select
    a.id,
    a.full_name,
    a.email,
    r.id,
    r.reservation_number,
    r.status,
    r.payment_status,
    r.buyer_country,
    r.buyer_age
  into
    v_attendee_id,
    v_full_name,
    v_email,
    v_reservation_id,
    v_reservation_number,
    v_res_status,
    v_pay_status,
    v_buyer_country,
    v_buyer_age
  from public.attendees a
  join public.reservations r on r.id = a.reservation_id
  where a.organization_id = p_organization_id
    and r.event_id = p_event_id
    and right(regexp_replace(r.reservation_number, '[^0-9]', '', 'g'), 6) = v_suffix
  limit 1;

  select coalesce(array_agg(a.full_name order by a.created_at), array[]::text[])
  into v_party_names
  from public.attendees a
  where a.reservation_id = v_reservation_id;

  select coalesce(string_agg(distinct tt.name, ', '), 'Paquete')
  into v_package_names
  from public.reservation_items ri
  join public.ticket_types tt on tt.id = ri.ticket_type_id
  where ri.reservation_id = v_reservation_id;

  if v_res_status is distinct from 'confirmed'::public.reservation_status
     or v_pay_status is distinct from 'paid'::public.payment_status then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_CONFIRMED',
      'message', 'La reserva no esta confirmada o el pago no figura como pagado',
      'attendee', jsonb_build_object(
        'fullName', v_full_name,
        'email', v_email,
        'reservationNumber', v_reservation_number,
        'reservationStatus', v_res_status::text,
        'paymentStatus', v_pay_status::text,
        'packageName', v_package_names
      ),
      'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
      'buyerCountry', v_buyer_country,
      'buyerAge', v_buyer_age
    );
  end if;

  begin
    insert into public.checkins (
      organization_id,
      attendee_id,
      event_id,
      session_id,
      scanned_by
    )
    values (
      p_organization_id,
      v_attendee_id,
      p_event_id,
      null,
      p_scanned_by
    )
    returning checked_in_at into v_checked_in_at;

    return jsonb_build_object(
      'ok', true,
      'code', 'CHECKED_IN',
      'message', 'Ingreso registrado',
      'checkedInAt', v_checked_in_at,
      'attendee', jsonb_build_object(
        'id', v_attendee_id,
        'fullName', v_full_name,
        'email', v_email,
        'reservationNumber', v_reservation_number,
        'packageName', v_package_names
      ),
      'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
      'buyerCountry', v_buyer_country,
      'buyerAge', v_buyer_age
    );
  exception
    when unique_violation then
      select c.checked_in_at
      into v_checked_in_at
      from public.checkins c
      where c.organization_id = p_organization_id
        and c.attendee_id = v_attendee_id
        and c.event_id = p_event_id
        and c.session_id is null
      limit 1;

      return jsonb_build_object(
        'ok', true,
        'code', 'ALREADY_CHECKED_IN',
        'message', 'Esta persona ya registro ingreso',
        'checkedInAt', v_checked_in_at,
        'attendee', jsonb_build_object(
          'id', v_attendee_id,
          'fullName', v_full_name,
          'email', v_email,
          'reservationNumber', v_reservation_number,
          'packageName', v_package_names
        ),
        'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
        'buyerCountry', v_buyer_country,
        'buyerAge', v_buyer_age
      );
  end;
end;
$$;

-- Preview: misma validación, sin insertar check-in
create or replace function public.gate_preview_checkin_by_qr(
  p_organization_id uuid,
  p_event_id uuid,
  p_qr_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_attendee_id uuid;
  v_reservation_id uuid;
  v_full_name text;
  v_email text;
  v_reservation_number text;
  v_res_status public.reservation_status;
  v_pay_status public.payment_status;
  v_package_names text;
  v_checked_in_at timestamptz;
  v_party_names text[];
  v_buyer_country text;
  v_buyer_age int;
begin
  v_token := nullif(trim(both from p_qr_token), '');
  if v_token is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'INVALID_TOKEN',
      'message', 'Codigo vacio o invalido'
    );
  end if;

  select
    a.id,
    a.full_name,
    a.email,
    r.id,
    r.reservation_number,
    r.status,
    r.payment_status,
    r.buyer_country,
    r.buyer_age
  into
    v_attendee_id,
    v_full_name,
    v_email,
    v_reservation_id,
    v_reservation_number,
    v_res_status,
    v_pay_status,
    v_buyer_country,
    v_buyer_age
  from public.attendees a
  join public.reservations r on r.id = a.reservation_id
  where a.organization_id = p_organization_id
    and r.event_id = p_event_id
    and a.qr_code = v_token
  limit 1;

  if v_attendee_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_FOUND',
      'message', 'QR no valido para este evento'
    );
  end if;

  select coalesce(array_agg(a.full_name order by a.created_at), array[]::text[])
  into v_party_names
  from public.attendees a
  where a.reservation_id = v_reservation_id;

  select coalesce(string_agg(distinct tt.name, ', '), 'Paquete')
  into v_package_names
  from public.reservation_items ri
  join public.ticket_types tt on tt.id = ri.ticket_type_id
  where ri.reservation_id = v_reservation_id;

  if v_res_status is distinct from 'confirmed'::public.reservation_status
     or v_pay_status is distinct from 'paid'::public.payment_status then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_CONFIRMED',
      'message', 'La reserva no esta confirmada o el pago no figura como pagado',
      'attendee', jsonb_build_object(
        'fullName', v_full_name,
        'email', v_email,
        'reservationNumber', v_reservation_number,
        'reservationStatus', v_res_status::text,
        'paymentStatus', v_pay_status::text,
        'packageName', v_package_names
      ),
      'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
      'buyerCountry', v_buyer_country,
      'buyerAge', v_buyer_age
    );
  end if;

  select c.checked_in_at
  into v_checked_in_at
  from public.checkins c
  where c.organization_id = p_organization_id
    and c.attendee_id = v_attendee_id
    and c.event_id = p_event_id
    and c.session_id is null
  limit 1;

  if v_checked_in_at is not null then
    return jsonb_build_object(
      'ok', true,
      'code', 'ALREADY_CHECKED_IN',
      'message', 'Esta persona ya registro ingreso',
      'checkedInAt', v_checked_in_at,
      'attendee', jsonb_build_object(
        'id', v_attendee_id,
        'fullName', v_full_name,
        'email', v_email,
        'reservationNumber', v_reservation_number,
        'packageName', v_package_names
      ),
      'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
      'buyerCountry', v_buyer_country,
      'buyerAge', v_buyer_age
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'code', 'READY_TO_CHECK_IN',
    'message', 'Listo para registrar ingreso',
    'attendee', jsonb_build_object(
      'id', v_attendee_id,
      'fullName', v_full_name,
      'email', v_email,
      'reservationNumber', v_reservation_number,
      'packageName', v_package_names
    ),
    'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
    'buyerCountry', v_buyer_country,
    'buyerAge', v_buyer_age
  );
end;
$$;

create or replace function public.gate_preview_checkin_by_reservation_suffix(
  p_organization_id uuid,
  p_event_id uuid,
  p_suffix text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_suffix text;
  v_match_count int;
  v_attendee_id uuid;
  v_reservation_id uuid;
  v_full_name text;
  v_email text;
  v_reservation_number text;
  v_res_status public.reservation_status;
  v_pay_status public.payment_status;
  v_package_names text;
  v_checked_in_at timestamptz;
  v_party_names text[];
  v_buyer_country text;
  v_buyer_age int;
begin
  v_suffix := regexp_replace(coalesce(p_suffix, ''), '[^0-9]', '', 'g');
  if length(v_suffix) < 6 then
    return jsonb_build_object(
      'ok', false,
      'code', 'INVALID_SUFFIX',
      'message', 'Indique 6 digitos del numero de reserva'
    );
  end if;
  v_suffix := right(v_suffix, 6);

  select count(*)::int
  into v_match_count
  from public.attendees a
  join public.reservations r on r.id = a.reservation_id
  where a.organization_id = p_organization_id
    and r.event_id = p_event_id
    and right(regexp_replace(r.reservation_number, '[^0-9]', '', 'g'), 6) = v_suffix;

  if v_match_count = 0 then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_FOUND',
      'message', 'Codigo no valido para este evento'
    );
  end if;

  if v_match_count > 1 then
    return jsonb_build_object(
      'ok', false,
      'code', 'AMBIGUOUS',
      'message', 'Varios asistentes coinciden; use el codigo QR del titular'
    );
  end if;

  select
    a.id,
    a.full_name,
    a.email,
    r.id,
    r.reservation_number,
    r.status,
    r.payment_status,
    r.buyer_country,
    r.buyer_age
  into
    v_attendee_id,
    v_full_name,
    v_email,
    v_reservation_id,
    v_reservation_number,
    v_res_status,
    v_pay_status,
    v_buyer_country,
    v_buyer_age
  from public.attendees a
  join public.reservations r on r.id = a.reservation_id
  where a.organization_id = p_organization_id
    and r.event_id = p_event_id
    and right(regexp_replace(r.reservation_number, '[^0-9]', '', 'g'), 6) = v_suffix
  limit 1;

  select coalesce(array_agg(a.full_name order by a.created_at), array[]::text[])
  into v_party_names
  from public.attendees a
  where a.reservation_id = v_reservation_id;

  select coalesce(string_agg(distinct tt.name, ', '), 'Paquete')
  into v_package_names
  from public.reservation_items ri
  join public.ticket_types tt on tt.id = ri.ticket_type_id
  where ri.reservation_id = v_reservation_id;

  if v_res_status is distinct from 'confirmed'::public.reservation_status
     or v_pay_status is distinct from 'paid'::public.payment_status then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_CONFIRMED',
      'message', 'La reserva no esta confirmada o el pago no figura como pagado',
      'attendee', jsonb_build_object(
        'fullName', v_full_name,
        'email', v_email,
        'reservationNumber', v_reservation_number,
        'reservationStatus', v_res_status::text,
        'paymentStatus', v_pay_status::text,
        'packageName', v_package_names
      ),
      'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
      'buyerCountry', v_buyer_country,
      'buyerAge', v_buyer_age
    );
  end if;

  select c.checked_in_at
  into v_checked_in_at
  from public.checkins c
  where c.organization_id = p_organization_id
    and c.attendee_id = v_attendee_id
    and c.event_id = p_event_id
    and c.session_id is null
  limit 1;

  if v_checked_in_at is not null then
    return jsonb_build_object(
      'ok', true,
      'code', 'ALREADY_CHECKED_IN',
      'message', 'Esta persona ya registro ingreso',
      'checkedInAt', v_checked_in_at,
      'attendee', jsonb_build_object(
        'id', v_attendee_id,
        'fullName', v_full_name,
        'email', v_email,
        'reservationNumber', v_reservation_number,
        'packageName', v_package_names
      ),
      'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
      'buyerCountry', v_buyer_country,
      'buyerAge', v_buyer_age
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'code', 'READY_TO_CHECK_IN',
    'message', 'Listo para registrar ingreso',
    'attendee', jsonb_build_object(
      'id', v_attendee_id,
      'fullName', v_full_name,
      'email', v_email,
      'reservationNumber', v_reservation_number,
      'packageName', v_package_names
    ),
    'partyNames', coalesce(to_jsonb(v_party_names), '[]'::jsonb),
    'buyerCountry', v_buyer_country,
    'buyerAge', v_buyer_age
  );
end;
$$;

grant execute on function public.gate_preview_checkin_by_qr(uuid, uuid, text) to service_role;
grant execute on function public.gate_preview_checkin_by_reservation_suffix(uuid, uuid, text) to service_role;
