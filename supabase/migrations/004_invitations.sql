create table invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  repo_id uuid not null references repos(id) on delete cascade,
  invited_by uuid not null references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(email, repo_id)
);

alter table invitations enable row level security;

create policy "repo owners can manage invitations"
  on invitations
  for all
  using (
    exists (
      select 1 from repos
      where repos.id = invitations.repo_id
      and repos.owner_id = auth.uid()
    )
  );
