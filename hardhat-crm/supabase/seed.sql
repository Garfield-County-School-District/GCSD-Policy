-- Sample data so the UI has something to show. Safe to skip in production.
-- Owner/assigned_to/created_by are left null so this runs without real users.
-- Enum literals are cast explicitly because UNION-ed selects infer text.

with c as (
  insert into companies (name, trade, status, lead_source, preferred_language, phone, accounting_software, annual_revenue, notes)
  values
    ('Summit Roofing LLC',        'roofing',     'prospect',      'referral', 'en', '555-0101', 'QuickBooks',   1200000, 'Referred by ABC Supply rep. Books are a mess, behind on job costing.'),
    ('Valley Paving Co',          'paving',      'active_client', 'web',      'en', '555-0102', 'QuickBooks',   3400000, 'In 90-day restructure. Monthly close on track.'),
    ('GreenScape Landscaping',    'landscaping', 'prospect',      'social',   'es', '555-0103', 'spreadsheets',  450000, 'Owner prefers Spanish. Needs cleanup before ongoing service.'),
    ('Peak HVAC Services',        'HVAC',        'active_client', 'partner',  'en', '555-0104', 'QuickBooks',   2100000, 'Profit strategy add-on starting next quarter.')
  returning id, name
)
insert into contacts (company_id, first_name, last_name, title, email, phone, preferred_language)
select id, 'Mike',  'Dawson',  'Owner',          'mike@summitroofing.example',  '555-0201', 'en'::language from c where name = 'Summit Roofing LLC'
union all
select id, 'Tom',   'Valle',   'Owner',          'tom@valleypaving.example',    '555-0202', 'en'::language from c where name = 'Valley Paving Co'
union all
select id, 'Rosa',  'Mendez',  'Owner',          'rosa@greenscape.example',     '555-0203', 'es'::language from c where name = 'GreenScape Landscaping'
union all
select id, 'Dana',  'Park',    'Office Manager', 'dana@peakhvac.example',       '555-0204', 'en'::language from c where name = 'Peak HVAC Services';

insert into deals (company_id, title, stage, service_type, estimated_monthly_value, expected_close_date)
select id, 'Summit Roofing — cleanup + ongoing',  'financial_inspection'::deal_stage, 'cleanup'::service_type,              750,  current_date + 21 from companies where name = 'Summit Roofing LLC'
union all
select id, 'Valley Paving — 90-day restructure',  'won'::deal_stage,                  'restructure_90day'::service_type,   1500, current_date - 10 from companies where name = 'Valley Paving Co'
union all
select id, 'GreenScape — discovery',              'discovery_call'::deal_stage,       'financial_inspection'::service_type, 500, current_date + 30 from companies where name = 'GreenScape Landscaping'
union all
select id, 'Peak HVAC — profit strategy upsell',  'proposal_sent'::deal_stage,        'profit_strategy'::service_type,     900,  current_date + 14 from companies where name = 'Peak HVAC Services';

insert into tasks (title, status, due_date, company_id)
select 'Send financial inspection findings', 'open'::task_status, current_date + 2, id from companies where name = 'Summit Roofing LLC'
union all
select 'Follow up on profit strategy proposal', 'open'::task_status, current_date + 5, id from companies where name = 'Peak HVAC Services'
union all
select 'Schedule discovery call (ES)', 'open'::task_status, current_date + 1, id from companies where name = 'GreenScape Landscaping';

insert into activities (type, summary, company_id, occurred_at)
select 'call'::activity_type, 'Intro call — discussed messy job costing and missed deadlines.', id, now() - interval '2 days' from companies where name = 'Summit Roofing LLC'
union all
select 'meeting'::activity_type, 'Kickoff meeting for 90-day restructure.', id, now() - interval '10 days' from companies where name = 'Valley Paving Co';
