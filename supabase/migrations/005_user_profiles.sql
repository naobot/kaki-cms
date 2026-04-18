create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  password_set boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can read and update their own profile"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);