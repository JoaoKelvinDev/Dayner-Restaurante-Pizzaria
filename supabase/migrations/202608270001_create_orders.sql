create extension if not exists pgcrypto;

create sequence if not exists public.order_number_seq start with 1000;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null unique default nextval('public.order_number_seq'),
  tracking_token uuid not null unique default gen_random_uuid(),
  mode text not null check (mode in ('comer_la', 'retirada', 'delivery')),
  customer_name text not null,
  customer_phone text not null,
  delivery_address jsonb,
  payment_method text not null check (payment_method in ('pix', 'cartao', 'dinheiro')),
  cash_change_for numeric(12, 2) check (cash_change_for > 0),
  payment_status text not null default 'pendente' check (payment_status in ('pendente', 'pago')),
  order_status text not null default 'recebido' check (order_status in ('recebido', 'em_preparo', 'pronto', 'saiu_entrega', 'finalizado')),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(12, 2) not null check (total >= 0),
  estimated_minutes integer check (estimated_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((mode = 'delivery' and delivery_address is not null) or (mode <> 'delivery' and delivery_address is null))
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null check (item_type in ('pizza', 'burguer', 'extra')),
  display_name text not null,
  details_text text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  note text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

create or replace function public.create_customer_order(p_order jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_subtotal numeric(12, 2);
  v_fee numeric(12, 2) := coalesce((p_order->>'delivery_fee')::numeric, 0);
  v_mode text := p_order->>'mode';
  v_payment_method text := p_order->>'payment_method';
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'O pedido precisa ter pelo menos um item';
  end if;

  if v_mode not in ('comer_la', 'retirada', 'delivery') then
    raise exception 'Modalidade inválida';
  end if;

  if v_payment_method not in ('pix', 'cartao', 'dinheiro') then
    raise exception 'Forma de pagamento inválida';
  end if;

  if v_mode = 'delivery' and p_order->'delivery_address' is null then
    raise exception 'Endereço é obrigatório para delivery';
  end if;

  select coalesce(sum((item->>'unit_price')::numeric * (item->>'quantity')::integer), 0)
    into v_subtotal
  from jsonb_array_elements(p_items) item;

  insert into public.orders (
    mode, customer_name, customer_phone, delivery_address,
    payment_method, cash_change_for, subtotal, delivery_fee, total
  ) values (
    v_mode,
    nullif(trim(p_order->>'customer_name'), ''),
    nullif(trim(p_order->>'customer_phone'), ''),
    case when v_mode = 'delivery' then p_order->'delivery_address' else null end,
    v_payment_method,
    case when v_payment_method = 'dinheiro' then nullif(p_order->>'cash_change_for', '')::numeric else null end,
    v_subtotal,
    v_fee,
    v_subtotal + v_fee
  ) returning * into v_order;

  insert into public.order_items (
    order_id, item_type, display_name, details_text,
    unit_price, quantity, note, details
  )
  select
    v_order.id,
    item->>'item_type',
    item->>'display_name',
    item->>'details_text',
    (item->>'unit_price')::numeric,
    (item->>'quantity')::integer,
    nullif(item->>'note', ''),
    item->'details'
  from jsonb_array_elements(p_items) item;

  return jsonb_build_object(
    'id', v_order.id,
    'tracking_token', v_order.tracking_token,
    'order_number', v_order.order_number
  );
end;
$$;

create or replace function public.get_customer_order(p_order_id uuid, p_tracking_token uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id', orders.id,
    'order_number', orders.order_number,
    'tracking_token', orders.tracking_token,
    'mode', orders.mode,
    'customer_name', orders.customer_name,
    'customer_phone', orders.customer_phone,
    'delivery_address', orders.delivery_address,
    'payment_method', orders.payment_method,
    'cash_change_for', orders.cash_change_for,
    'payment_status', orders.payment_status,
    'order_status', orders.order_status,
    'subtotal', orders.subtotal,
    'delivery_fee', orders.delivery_fee,
    'total', orders.total,
    'estimated_minutes', orders.estimated_minutes,
    'created_at', orders.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', order_items.id,
        'item_type', order_items.item_type,
        'display_name', order_items.display_name,
        'details_text', order_items.details_text,
        'unit_price', order_items.unit_price,
        'quantity', order_items.quantity,
        'note', order_items.note,
        'details', order_items.details
      ) order by order_items.created_at)
      from public.order_items where order_items.order_id = orders.id
    ), '[]'::jsonb)
  )
  from public.orders
  where orders.id = p_order_id and orders.tracking_token = p_tracking_token;
$$;

revoke all on function public.create_customer_order(jsonb, jsonb) from public;
revoke all on function public.get_customer_order(uuid, uuid) from public;
grant execute on function public.create_customer_order(jsonb, jsonb) to anon, authenticated;
grant execute on function public.get_customer_order(uuid, uuid) to anon, authenticated;
