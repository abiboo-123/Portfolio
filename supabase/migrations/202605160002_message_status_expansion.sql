-- Additive message workflow support.
-- If contact_messages.status has a check constraint, replace it with the expanded state list.

do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'contact_messages'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%status%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.contact_messages drop constraint %I', constraint_name);
  end if;

  alter table public.contact_messages
    add constraint contact_messages_status_check
    check (status in ('new', 'delivered', 'read', 'replied', 'archived'));
end $$;

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);
