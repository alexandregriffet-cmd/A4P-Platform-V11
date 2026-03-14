create extension if not exists "pgcrypto";

create table if not exists test_results_master (
  id uuid primary key default gen_random_uuid(),
  module text,
  firstname text,
  lastname text,
  email text,
  club_name text,
  team_name text,
  score_global integer,
  profile_name text,
  dimensions jsonb,
  raw_result jsonb,
  created_at timestamptz default now()
);
