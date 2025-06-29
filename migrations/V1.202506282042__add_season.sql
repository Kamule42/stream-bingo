SET ROLE role_bingo_admin;

CREATE TABLE IF NOT EXISTS bingo.seasons(
  id UUID PRIMARY KEY default gen_random_uuid(),
  name text,
  stream_id UUID NOT NULL REFERENCES bingo.streams(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT null,
  deleted_at timestamp with time zone DEFAULT null
);
GRANT select, update, insert, delete ON bingo.seasons TO role_bingo_app;


ALTER TABLE bingo.rounds
  ADD column season_id UUID NULL REFERENCES bingo.seasons(id);
