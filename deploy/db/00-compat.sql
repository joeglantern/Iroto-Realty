-- Stand-ins for the Supabase internals the exported schema refers to, so the
-- public-schema dump from Supabase restores without edits.
--   * RLS policies name the anon/authenticated roles.
--   * Triggers call auth.uid() to fill created_by / updated_by / approved_by.
--     The admin app sets request.jwt.claim.sub per transaction (see admin/src/lib/session.ts).
--   * profiles.id has a foreign key to auth.users; 20-finalize.sql repoints it
--     to the Better Auth "user" table and drops this stub.
-- The apps connect as the database owner, which bypasses RLS; access control lives in the apps.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then create publication supabase_realtime; end if;
end $$;

create schema if not exists extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists auth;

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select case when auth.uid() is null then 'anon' else 'authenticated' end
$$;

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;

-- Filled from migration-export/db/auth_users.csv before the public schema is restored.
create table if not exists auth.users (
  id uuid primary key,
  email text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  raw_user_meta_data jsonb,
  created_at timestamptz,
  last_sign_in_at timestamptz
);
