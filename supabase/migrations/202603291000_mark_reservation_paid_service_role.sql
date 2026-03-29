-- Permite ejecutar el RPC desde rutas API con service role (tras validar sesión en app).
grant execute on function public.mark_reservation_paid(uuid, uuid, public.payment_provider, text, numeric, text) to service_role;
