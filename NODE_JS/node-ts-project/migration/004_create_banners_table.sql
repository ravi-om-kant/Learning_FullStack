create table banners(
    id UUID primary key default gen_random_uuid(),

    image_url text not null,
    cloudinary_public_id text not null,
    
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
