-- Move Supabase logins into Better Auth, keeping the same user ids so profiles,
-- created_by and updated_by keep pointing at the right people. Supabase stored
-- bcrypt hashes, which admin/src/lib/auth.ts verifies, so existing passwords keep working.

begin;

insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
select
  u.id,
  coalesce(nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), split_part(u.email, '@', 1)),
  lower(u.email),
  u.email_confirmed_at is not null,
  coalesce(u.created_at, now()),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where u.email is not null
on conflict do nothing;

insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
select gen_random_uuid(), u.id::text, 'credential', u.id, u.encrypted_password, now(), now()
from auth.users u
join "user" nu on nu.id = u.id
where coalesce(u.encrypted_password, '') <> ''
  and not exists (select 1 from account a where a."userId" = u.id and a."providerId" = 'credential');

-- profiles now hang off the Better Auth user table instead of auth.users.
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id) references "user" (id) on delete cascade not valid;

-- Only fired from the auth.users trigger, which does not exist here.
drop function if exists public.handle_new_user() cascade;

drop table auth.users;

commit;
