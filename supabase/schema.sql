-- GHL Tutor Agent production schema
-- Run this in the Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.app_role as enum ('student', 'instructor', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  practice_complete boolean not null default false,
  practice_steps jsonb not null default '{}'::jsonb,
  builder_notes text,
  testing_notes text,
  proof_file_path text,
  proof_file_name text,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  score integer not null,
  total integer not null,
  percent integer not null,
  passed boolean not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  submission jsonb not null default '{}'::jsonb,
  review text,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_progress_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  manual_progress jsonb not null default '{}'::jsonb,
  quiz_results jsonb not null default '{}'::jsonb,
  portfolio_notes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.ai_reviews enable row level security;
alter table public.student_progress_snapshots enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Students read own lesson progress" on public.lesson_progress;
create policy "Students read own lesson progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Students write own lesson progress" on public.lesson_progress;
create policy "Students write own lesson progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Students update own lesson progress" on public.lesson_progress;
create policy "Students update own lesson progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Students read own quiz attempts" on public.quiz_attempts;
create policy "Students read own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "Students insert own quiz attempts" on public.quiz_attempts;
create policy "Students insert own quiz attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Students read own AI reviews" on public.ai_reviews;
create policy "Students read own AI reviews"
  on public.ai_reviews for select
  using (auth.uid() = user_id);

drop policy if exists "Students insert own AI reviews" on public.ai_reviews;
create policy "Students insert own AI reviews"
  on public.ai_reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "Students update own AI reviews" on public.ai_reviews;
create policy "Students update own AI reviews"
  on public.ai_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Students read own progress snapshot" on public.student_progress_snapshots;
create policy "Students read own progress snapshot"
  on public.student_progress_snapshots for select
  using (auth.uid() = user_id);

drop policy if exists "Students insert own progress snapshot" on public.student_progress_snapshots;
create policy "Students insert own progress snapshot"
  on public.student_progress_snapshots for insert
  with check (auth.uid() = user_id);

drop policy if exists "Students update own progress snapshot" on public.student_progress_snapshots;
create policy "Students update own progress snapshot"
  on public.student_progress_snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.has_staff_role()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('instructor', 'admin')
  );
$$;

drop policy if exists "Staff read profiles" on public.profiles;
create policy "Staff read profiles"
  on public.profiles for select
  using (public.has_staff_role());

drop policy if exists "Staff read lesson progress" on public.lesson_progress;
create policy "Staff read lesson progress"
  on public.lesson_progress for select
  using (public.has_staff_role());

drop policy if exists "Staff read quiz attempts" on public.quiz_attempts;
create policy "Staff read quiz attempts"
  on public.quiz_attempts for select
  using (public.has_staff_role());

drop policy if exists "Staff read AI reviews" on public.ai_reviews;
create policy "Staff read AI reviews"
  on public.ai_reviews for select
  using (public.has_staff_role());

drop policy if exists "Staff read progress snapshots" on public.student_progress_snapshots;
create policy "Staff read progress snapshots"
  on public.student_progress_snapshots for select
  using (public.has_staff_role());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists lesson_progress_touch_updated_at on public.lesson_progress;
create trigger lesson_progress_touch_updated_at
  before update on public.lesson_progress
  for each row execute function public.touch_updated_at();

drop trigger if exists ai_reviews_touch_updated_at on public.ai_reviews;
create trigger ai_reviews_touch_updated_at
  before update on public.ai_reviews
  for each row execute function public.touch_updated_at();

drop trigger if exists student_progress_snapshots_touch_updated_at on public.student_progress_snapshots;
create trigger student_progress_snapshots_touch_updated_at
  before update on public.student_progress_snapshots
  for each row execute function public.touch_updated_at();

insert into storage.buckets (id, name, public)
values ('practice-proof', 'practice-proof', false)
on conflict (id) do nothing;

drop policy if exists "Students read own proof files" on storage.objects;
create policy "Students read own proof files"
  on storage.objects for select
  using (
    bucket_id = 'practice-proof'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Students upload own proof files" on storage.objects;
create policy "Students upload own proof files"
  on storage.objects for insert
  with check (
    bucket_id = 'practice-proof'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Students update own proof files" on storage.objects;
create policy "Students update own proof files"
  on storage.objects for update
  using (
    bucket_id = 'practice-proof'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'practice-proof'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
