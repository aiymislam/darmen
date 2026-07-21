create table if not exists public.player_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  highest_level integer not null default 1 check (highest_level between 1 and 15),
  updated_at timestamptz not null default now()
);

alter table public.player_progress enable row level security;

create policy "leaderboard is public"
  on public.player_progress for select
  using (true);

create or replace function public.record_player_progress(player_name text, reached_level integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.player_progress (user_id, display_name, highest_level, updated_at)
  values (auth.uid(), left(trim(player_name), 40), greatest(1, least(reached_level, 15)), now())
  on conflict (user_id) do update
  set display_name = excluded.display_name,
      highest_level = greatest(player_progress.highest_level, excluded.highest_level),
      updated_at = case
        when excluded.highest_level > player_progress.highest_level then now()
        else player_progress.updated_at
      end;
end;
$$;

grant execute on function public.record_player_progress(text, integer) to authenticated;
