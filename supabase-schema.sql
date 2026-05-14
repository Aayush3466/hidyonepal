-- Run this entire file in Supabase SQL Editor

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  trekker_level text default 'beginner',
  created_at timestamptz default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text,
  post_type text default 'text',
  tags text[] default '{}',
  location text,
  data_sections jsonb default '[]',
  poll_options jsonb default '[]',
  vote_count int default 0,
  comment_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  value int not null,
  unique(user_id, post_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  location text,
  trek_date date,
  max_members int default 10,
  tags text[] default '{}',
  status text default 'open',
  is_private boolean default false,
  created_at timestamptz default now()
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'pending',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

create table public.group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text default 'other',
  condition text default 'good',
  listing_type text default 'rent',
  price_per_day numeric,
  location text,
  tags text[] default '{}',
  images text[] default '{}',
  is_available boolean default true,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Vote count trigger
create or replace function update_vote_count()
returns trigger as $$
begin
  update public.posts
  set vote_count = (select coalesce(sum(value),0) from public.votes where post_id = coalesce(new.post_id, old.post_id))
  where id = coalesce(new.post_id, old.post_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_vote_change
  after insert or update or delete on public.votes
  for each row execute procedure update_vote_count();

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_posts enable row level security;
alter table public.equipment enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on public.posts for update using (auth.uid() = author_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = author_id);

create policy "votes_select" on public.votes for select using (true);
create policy "votes_insert" on public.votes for insert with check (auth.uid() = user_id);
create policy "votes_update" on public.votes for update using (auth.uid() = user_id);
create policy "votes_delete" on public.votes for delete using (auth.uid() = user_id);

create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = author_id);

create policy "groups_select" on public.groups for select using (true);
create policy "groups_insert" on public.groups for insert with check (auth.uid() = creator_id);
create policy "groups_update" on public.groups for update using (auth.uid() = creator_id);
create policy "groups_delete" on public.groups for delete using (auth.uid() = creator_id);

create policy "group_members_select" on public.group_members for select using (true);
create policy "group_members_insert" on public.group_members for insert with check (auth.uid() = user_id);
create policy "group_members_update" on public.group_members for update
  using (exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'admin'));
create policy "group_members_delete" on public.group_members for delete
  using (auth.uid() = user_id or exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'admin'));

create policy "group_posts_select" on public.group_posts for select
  using (exists (select 1 from public.group_members gm where gm.group_id = group_posts.group_id and gm.user_id = auth.uid() and gm.role in ('admin','member')));
create policy "group_posts_insert" on public.group_posts for insert
  with check (auth.uid() = author_id and exists (select 1 from public.group_members gm where gm.group_id = group_posts.group_id and gm.user_id = auth.uid() and gm.role in ('admin','member')));

create policy "equipment_select" on public.equipment for select using (true);
create policy "equipment_insert" on public.equipment for insert with check (auth.uid() = owner_id);
create policy "equipment_update" on public.equipment for update using (auth.uid() = owner_id);
create policy "equipment_delete" on public.equipment for delete using (auth.uid() = owner_id);
