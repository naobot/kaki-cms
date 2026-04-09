create table github_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  updated_at timestamptz not null default now()
);

alter table github_tokens enable row level security;

create policy "users can manage their own token"
  on github_tokens
  for all
  using (auth.uid() = user_id);
