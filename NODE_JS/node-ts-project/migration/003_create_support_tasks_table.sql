
create table support_tasks(
    id UUID primary key default gen_random_uuid(),
    title varchar(150) not null,
    status varchar(20) not null default 'OPEN'
        check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED')),

    user_id UUID not null references users(id) on delete cascade,

    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
)