-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  github_repo text not null, -- format: "owner/repo-name" e.g. "nao/alice-portfolio"
  config_path text not null default 'cms.config.json',
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "owners can manage their own projects"
  on projects
  for all
  using (auth.uid() = owner_id);

-- Project members table
create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(project_id, user_id)
);

alter table project_members enable row level security;

create policy "members can read their own memberships"
  on project_members
  for select
  using (auth.uid() = user_id);

create policy "owners can manage project members"
  on project_members
  for all
  using (
    exists (
      select 1 from projects
      where projects.id = project_members.project_id
      and projects.owner_id = auth.uid()
    )
  );