create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists clubs (
  club_id uuid primary key default gen_random_uuid(),
  club_name text not null,
  created_at timestamptz default now()
);

create table if not exists coaches (
  coach_id uuid primary key default gen_random_uuid(),
  email text unique not null,
  club_id uuid references clubs(club_id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists teams (
  team_id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(club_id) on delete cascade,
  team_name text not null,
  sport text,
  category text,
  created_at timestamptz default now()
);

create table if not exists passations (
  passation_id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(club_id) on delete cascade,
  team_id uuid not null references teams(team_id) on delete cascade,
  module text not null check (module in ('CMP','PMP','PSYCHO')),
  token text not null unique,
  status text not null default 'active' check (status in ('active','closed')),
  created_at timestamptz default now()
);

create table if not exists tests (
  test_id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('individual','club')),
  module text not null,
  club_id uuid references clubs(club_id) on delete set null,
  team_id uuid references teams(team_id) on delete set null,
  passation_id uuid references passations(passation_id) on delete set null,
  player_firstname text not null,
  player_lastname text not null,
  player_email text,
  score_global integer not null,
  dimensions jsonb not null,
  profile_code text,
  profile_name text,
  created_at timestamptz default now()
);

create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(test_id) on delete set null,
  recipient_email text not null,
  subject text not null,
  status text not null,
  provider_message_id text,
  payload jsonb,
  sent_at timestamptz default now()
);

alter table clubs enable row level security;
alter table coaches enable row level security;
alter table teams enable row level security;
alter table passations enable row level security;
alter table tests enable row level security;
alter table email_logs enable row level security;

create policy "authenticated_read_clubs" on clubs for select to authenticated using (true);
create policy "authenticated_insert_clubs" on clubs for insert to authenticated with check (true);
create policy "authenticated_read_teams" on teams for select to authenticated using (true);
create policy "authenticated_insert_teams" on teams for insert to authenticated with check (true);
create policy "authenticated_read_passations" on passations for select to authenticated using (true);
create policy "authenticated_insert_passations" on passations for insert to authenticated with check (true);
create policy "authenticated_read_tests" on tests for select to authenticated using (true);
create policy "public_insert_tests" on tests for insert to anon, authenticated with check (true);
create policy "authenticated_read_email_logs" on email_logs for select to authenticated using (true);
