-- ----------------------------------------------------
-- Two things worth understanding in that second table
-- ----------------------------------------------------

-- on delete cascade on product_id — if a product is ever deleted from the catalog, all listings for it are automatically deleted too (no orphaned listings pointing to a non-existent product).
-- unique (product_id, seller_id) — prevents the same seller from creating two separate listings for the same product. If they want to update their price, they update their existing row, not insert a new one.

create table if not exists product_listings(
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references products(id) on delete restrict,
    seller_id uuid not null references users(id),
    price numeric(10, 2) not null,
    stock integer not null default 0,
    condition varchar(20) not null default 'new'
        check (condition in ('new', 'used', 'refurbished')),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    unique(product_id, seller_id)
);

create index if not exists product_listings_seller_id_idx on product_listings(seller_id);