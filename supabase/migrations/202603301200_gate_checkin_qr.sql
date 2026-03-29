-- Un solo registro de ingreso por asistente y evento cuando no hay sesión (puerta general).
-- Evita duplicados bajo escaneo concurrente (índice único parcial + manejo de unique_violation en la función).
create unique index if not exists checkins_org_attendee_event_null_session_uidx
  on public.checkins (organization_id, attendee_id, event_id)
  where session_id is null;

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
    and a.qr_code = v_token
  limit 1;

  if v_attendee_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'NOT_FOUND',
      'message', 'QR no valido para este evento'
    );
  end if;

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

grant execute on function public.gate_register_checkin_by_qr(uuid, uuid, text, uuid) to service_role;
