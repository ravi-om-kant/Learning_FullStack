CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(225) not null unique,
    password_hash text,
    google_id varchar(225) unique,
    role varchar(20) not null default 'USER'
        check (role in ('USER', 'ADMIN')),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
)