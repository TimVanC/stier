-- Increment review helpful_count via SECURITY DEFINER (users cannot UPDATE others' rows).

create or replace function public.increment_review_helpful(p_review_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.reviews
  set helpful_count = helpful_count + 1
  where id = p_review_id
  returning helpful_count into v_count;

  if v_count is null then
    raise exception 'review not found' using errcode = 'P0002';
  end if;

  return v_count;
end;
$$;

revoke all on function public.increment_review_helpful(uuid) from public;
grant execute on function public.increment_review_helpful(uuid) to authenticated;
