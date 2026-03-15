-- PATCH V11 / Sprint 2
-- Aligne les tables existantes sur les colonnes attendues par l'app Sprint 2

create extension if not exists pgcrypto;

alter table if exists teams
  add column if not exists team_id uuid default gen_random_uuid(),
  add column if not exists team_name text,
  add column if not exists sport text,
  add column if not exists category text;

alter table if exists players
  add column if not exists player_id uuid default gen_random_uuid(),
  add column if not exists firstname text,
  add column if not exists lastname text,
  add column if not exists position text;

alter table if exists passations
  add column if not exists passation_id uuid default gen_random_uuid(),
  add column if not exists club_id uuid,
  add column if not exists team_id uuid,
  add column if not exists module text default 'CMP';

alter table if exists tests
  add column if not exists test_id uuid default gen_random_uuid(),
  add column if not exists club_id uuid,
  add column if not exists team_id uuid,
  add column if not exists passation_id uuid,
  add column if not exists score_global numeric,
  add column if not exists dimensions jsonb,
  add column if not exists profile_code text,
  add column if not exists profile_name text,
  add column if not exists player_firstname text,
  add column if not exists player_lastname text;

update teams
set team_name = coalesce(team_name, name)
where team_name is null;

update players
set firstname = coalesce(firstname, first_name),
    lastname = coalesce(lastname, last_name)
where firstname is null or lastname is null;

create unique index if not exists teams_team_id_key on teams(team_id);
create unique index if not exists players_player_id_key on players(player_id);
create unique index if not exists passations_passation_id_key on passations(passation_id);
create unique index if not exists tests_test_id_key on tests(test_id);
