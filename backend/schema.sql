-- Reference schema only. Production deployment requires security/privacy review.
create table if not exists participants (
  participant_id text primary key,
  profile_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists research_events (
  event_id text primary key,
  schema_version integer not null,
  occurred_at timestamptz not null,
  participant_id text null references participants(participant_id),
  project_id text null,
  session_id text null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index if not exists idx_events_participant on research_events(participant_id, occurred_at desc);
create index if not exists idx_events_project on research_events(project_id, occurred_at desc);
create index if not exists idx_events_session on research_events(session_id);
create index if not exists idx_events_type on research_events(event_type, occurred_at desc);

-- Admin users must be implemented through provider/server authentication.
-- Never expose unrestricted SELECT access to the browser.
