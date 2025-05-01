-- Drop the table if it exists
drop table if exists public.nutrition_targets;

-- Create the table
create table public.nutrition_targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  target_calories integer not null,
  target_protein integer not null,
  target_carbs integer not null,
  target_fat integer not null,
  target_water integer not null,
  weekly_weight_targets jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable RLS
alter table public.nutrition_targets enable row level security;

-- Create policy for users to see only their own targets
create policy "Users can view their own targets"
  on public.nutrition_targets for select
  using (auth.uid() = user_id);

-- Create policy for users to insert their own targets
create policy "Users can insert their own targets"
  on public.nutrition_targets for insert
  with check (auth.uid() = user_id);

-- Create policy for users to update their own targets
create policy "Users can update their own targets"
  on public.nutrition_targets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to call the function before update
drop trigger if exists update_nutrition_targets_updated_at on public.nutrition_targets;
create trigger update_nutrition_targets_updated_at
  before update on public.nutrition_targets
  for each row
  execute function update_updated_at_column(); 