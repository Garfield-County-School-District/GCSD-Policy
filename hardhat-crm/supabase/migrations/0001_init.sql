-- Hard Hat CRM — initial schema
-- Run against a fresh Supabase project (SQL editor, CLI migration, or apply_migration).

-- ---------------------------------------------------------------------------
-- Enums (domain-specific to a construction-bookkeeping firm)
-- ---------------------------------------------------------------------------
create type language        as enum ('en', 'es');
create type company_status  as enum ('prospect', 'active_client', 'churned');
create type lead_source     as enum ('referral', 'web', 'partner', 'social', 'other');
create type deal_stage      as enum ('new_lead', 'discovery_call', 'financial_inspection', 'proposal_sent', 'won', 'lost');
create type service_type    as enum ('financial_inspection', 'restructure_90day', 'cleanup', 'ongoing_bookkeeping', 'profit_strategy');
create type activity_type   as enum ('call', 'email', 'meeting', 'note');
create type task_status     as enum ('open', 'done');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Companies — the contractor businesses (prospects & clients)
-- ---------------------------------------------------------------------------
create table companies (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  trade               text,                                 -- roofing, paving, landscaping, HVAC, concrete, other
  status              company_status not null default 'prospect',
  lead_source         lead_source,
  preferred_language  language default 'en',
  phone               text,
  website             text,
  address             text,
  accounting_software text,                                 -- QuickBooks, Xero, spreadsheets, none
  annual_revenue      numeric,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger trg_companies_updated before update on companies
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Contacts — people at the companies
-- ---------------------------------------------------------------------------
create table contacts (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid references companies(id) on delete cascade,
  first_name          text not null,
  last_name           text,
  title               text,                                 -- owner, office manager, ...
  email               text,
  phone               text,
  preferred_language  language default 'en',
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index contacts_company_id_idx on contacts(company_id);
create trigger trg_contacts_updated before update on contacts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Deals — opportunities moving through Hard Hat's funnel
-- ---------------------------------------------------------------------------
create table deals (
  id                      uuid primary key default gen_random_uuid(),
  company_id              uuid references companies(id) on delete cascade,
  title                   text not null,
  stage                   deal_stage not null default 'new_lead',
  service_type            service_type,
  estimated_monthly_value numeric,
  expected_close_date     date,
  owner                   uuid references auth.users(id) on delete set null,
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index deals_company_id_idx on deals(company_id);
create index deals_stage_idx on deals(stage);
create trigger trg_deals_updated before update on deals
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Activities — logged interactions (calls, emails, meetings, notes)
-- ---------------------------------------------------------------------------
create table activities (
  id          uuid primary key default gen_random_uuid(),
  type        activity_type not null default 'note',
  summary     text not null,
  company_id  uuid references companies(id) on delete cascade,
  contact_id  uuid references contacts(id) on delete set null,
  deal_id     uuid references deals(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index activities_company_id_idx on activities(company_id);
create index activities_deal_id_idx on activities(deal_id);

-- ---------------------------------------------------------------------------
-- Tasks — follow-ups & reminders
-- ---------------------------------------------------------------------------
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  status      task_status not null default 'open',
  due_date    date,
  assigned_to uuid references auth.users(id) on delete set null,
  company_id  uuid references companies(id) on delete cascade,
  contact_id  uuid references contacts(id) on delete set null,
  deal_id     uuid references deals(id) on delete set null,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index tasks_status_due_idx on tasks(status, due_date);
create index tasks_company_id_idx on tasks(company_id);
create trigger trg_tasks_updated before update on tasks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Small shared internal team: any signed-in staff member can read/write all
-- CRM records. (Tighten later if you add client-facing or per-owner access.)
-- ---------------------------------------------------------------------------
alter table companies  enable row level security;
alter table contacts   enable row level security;
alter table deals      enable row level security;
alter table activities enable row level security;
alter table tasks      enable row level security;

create policy "staff full access" on companies  for all to authenticated using (true) with check (true);
create policy "staff full access" on contacts   for all to authenticated using (true) with check (true);
create policy "staff full access" on deals       for all to authenticated using (true) with check (true);
create policy "staff full access" on activities for all to authenticated using (true) with check (true);
create policy "staff full access" on tasks       for all to authenticated using (true) with check (true);
