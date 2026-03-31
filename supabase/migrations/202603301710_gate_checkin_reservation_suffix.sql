-- Check-in manual por últimos 6 dígitos del número de reserva (además del QR).

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
    r.payment_status
  into
    v_attendee_id,
    v_full_name,
    v_email,
    v_reservation_id,
    v_reservation_number,
    v_res_status,
    v_pay_status
  from public.attendees a
  join public.reservations r on r.id = a.reservation_id
  where a.organization_id = p_organization_id
    and r.event_id = p_event_id
    and right(regexp_replace(r.reservation_number, '[^0-9]', '', 'g'), 6) = v_suffix
  limit 1;

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
        'paymentStatus', v_pay_status::text
      )
    );
  end if;

  select coalesce(string_agg(distinct tt.name, ', '), 'Paquete')
  into v_package_names
  from public.reservation_items ri
  join public.ticket_types tt on tt.id = ri.ticket_type_id
  where ri.reservation_id = v_reservation_id;

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
      )
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
        )
      );
  end;
end;
$$;

grant execute on function public.gate_register_checkin_by_reservation_suffix(uuid, uuid, text, uuid) to service_role;
