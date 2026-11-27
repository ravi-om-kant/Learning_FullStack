create table if not exists products(
    id uuid primary key default gen_random_uuid(),
    name varchar(200) not null,
    description text,
    category varchar(100),
    brand varchar(100),
    created_by uuid not null references users(id),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);