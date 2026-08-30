create or replace function public.grant_admin_premium()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from auth.users u
    where u.id = new.id and lower(u.email) = 'sulaydelcarmen1@gmail.com'
  ) then
    new.is_premium := true;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_admin_premium on public.profiles;
create trigger profiles_admin_premium
before insert or update on public.profiles
for each row execute function public.grant_admin_premium();

update public.profiles p
set is_premium = true
where exists (
  select 1 from auth.users u
  where u.id = p.id and lower(u.email) = 'sulaydelcarmen1@gmail.com'
);