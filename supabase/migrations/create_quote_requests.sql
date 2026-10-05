-- Fase 1: Pedido de cotação pelo site
-- Execute DEPOIS de create_orders.sql, no Supabase SQL Editor.
-- O visitante do site não acessa as tabelas de pedidos diretamente: ele só pode
-- chamar esta função, que valida os dados e cria lead + pedido + itens de uma vez.

create or replace function public.submit_quote_request(payload jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(payload ->> 'name'), '');
  v_email text := nullif(lower(trim(payload ->> 'email')), '');
  v_phone text := nullif(trim(payload ->> 'phone'), '');
  v_company text := nullif(trim(payload ->> 'company'), '');
  v_city text := nullif(trim(payload ->> 'city'), '');
  v_message text := nullif(trim(payload ->> 'message'), '');
  v_locale text := coalesce(nullif(payload ->> 'locale', ''), 'pt');
  v_items jsonb := coalesce(payload -> 'items', '[]'::jsonb);
  v_item jsonb;
  v_product record;
  v_quantity numeric;
  v_lead_id uuid;
  v_order_id uuid;
  v_order_code text;
  v_product_names text[] := '{}';
begin
  if v_name is null or char_length(v_name) > 120 then
    raise exception 'invalid_name';
  end if;

  if v_email is null and v_phone is null then
    raise exception 'missing_contact';
  end if;

  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;

  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 or jsonb_array_length(v_items) > 30 then
    raise exception 'invalid_items';
  end if;

  if char_length(coalesce(v_message, '')) > 2000 or char_length(coalesce(v_company, '')) > 160 then
    raise exception 'text_too_long';
  end if;

  -- Proteção simples contra abuso: no máximo 5 cotações por contato por hora
  if (
    select count(*)
    from public.orders
    where source = 'site_cotacao'
      and created_at > now() - interval '1 hour'
      and (customer_email = v_email or customer_phone = v_phone)
  ) >= 5 then
    raise exception 'rate_limited';
  end if;

  insert into public.leads (name, company, email, phone, city, message, source, status)
  values (v_name, v_company, v_email, v_phone, v_city, v_message, 'site_cotacao', 'Novo')
  returning id into v_lead_id;

  insert into public.orders (
    lead_id, customer_name, customer_company, customer_email, customer_phone,
    destination_country, destination_city, source, currency, notes
  )
  values (
    v_lead_id, v_name, v_company, v_email, v_phone,
    case when v_locale = 'zh' then null else 'Brasil' end, v_city, 'site_cotacao', 'BRL', v_message
  )
  returning id, code into v_order_id, v_order_code;

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_quantity := (v_item ->> 'quantity')::numeric;

    if v_quantity is null or v_quantity <= 0 or v_quantity > 10000000 then
      raise exception 'invalid_quantity';
    end if;

    select id, name into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
      and status = 'published';

    if not found then
      raise exception 'invalid_product';
    end if;

    insert into public.order_items (order_id, product_id, description, quantity, unit, unit_price)
    values (v_order_id, v_product.id, v_product.name, v_quantity, 'un', 0);

    v_product_names := array_append(v_product_names, v_product.name);
  end loop;

  update public.leads
  set product_interest = left(array_to_string(v_product_names, ', '), 500)
  where id = v_lead_id;

  return v_order_code;
end;
$$;

revoke all on function public.submit_quote_request(jsonb) from public;
grant execute on function public.submit_quote_request(jsonb) to anon, authenticated;
