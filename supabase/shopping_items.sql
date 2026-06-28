-- Run in the Supabase SQL editor (Dashboard → SQL → New query).

create table if not exists public.shopping_items (
    id uuid primary key default gen_random_uuid(),
    text text not null check (char_length(text) between 1 and 200),
    bought boolean not null default false,
    added_at bigint not null,
    bought_at bigint
);

alter table public.shopping_items enable row level security;

create policy "shopping_items_select"
    on public.shopping_items for select
    using (true);

create policy "shopping_items_insert"
    on public.shopping_items for insert
    with check (true);

create policy "shopping_items_update"
    on public.shopping_items for update
    using (true);

create policy "shopping_items_delete"
    on public.shopping_items for delete
    using (true);

-- Dashboard → Database → Replication → enable Realtime for shopping_items.
-- Or: alter publication supabase_realtime add table public.shopping_items;
