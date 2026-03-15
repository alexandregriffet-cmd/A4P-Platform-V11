create extension if not exists pgcrypto;

alter table if exists teams
  add column if not exists club_id uuid,
  add column if not exists name text,
  add column if not exists team_name text,
  add column if not exists season text,
  add column if not exists created_at timestamptz default now();

alter table if exists players
  add column if not exists team_id uuid,
  add column if not exists firstname text,
  add column if not exists lastname text,
  add column if not exists email text,
  add column if not exists position text,
  add column if not exists created_at timestamptz default now();

alter table if exists passations
  add column if not exists player_id uuid,
  add column if not exists team_id uuid,
  add column if not exists club_id uuid,
  add column if not exists module text default 'CMP',
  add column if not exists token text,
  add column if not exists status text default 'pending',
  add column if not exists created_at timestamptz default now();

create unique index if not exists passations_token_idx on passations(token);

notify pgrst, 'reload schema';
