create extension if not exists "pgcrypto";

create table if not exists passations (
  passation_id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(club_id) on delete cascade,
  team_id uuid not null references teams(team_id) on delete cascade,
  module text not null check (module in ('CMP','PMP','PSYCHO')),
  token text not null unique,
  status text not null default 'active' check (status in ('active','closed')),
  created_by uuid,
  created_at timestamp with time zone default now()
);

alter table tests
  add column if not exists team_id uuid references teams(team_id) on delete set null,
  add column if not exists club_id uuid references clubs(club_id) on delete set null,
  add column if not exists passation_id uuid references passations(passation_id) on delete set null,
  add column if not exists profile_code text,
  add column if not exists profile_name text,
  add column if not exists player_firstname text,
  add column if not exists player_lastname text;

alter table teams
  add column if not exists created_at timestamp with time zone default now();

alter table players
  add column if not exists created_at timestamp with time zone default now();

alter table teams enable row level security;
alter table players enable row level security;
alter table passations enable row level security;
alter table tests enable row level security;

create policy "teams_select_authenticated"
on teams for select
to authenticated
using (true);

create policy "teams_insert_authenticated"
on teams for insert
to authenticated
with check (true);

create policy "players_select_authenticated"
on players for select
to authenticated
using (true);

create policy "players_insert_authenticated"
on players for insert
to authenticated
with check (true);

create policy "passations_select_authenticated"
on passations for select
to authenticated
using (true);

create policy "passations_insert_authenticated"
on passations for insert
to authenticated
with check (true);

create policy "tests_insert_public"
on tests for insert
to anon, authenticated
with check (true);

create policy "tests_select_authenticated"
on tests for select
to authenticated
using (true);
