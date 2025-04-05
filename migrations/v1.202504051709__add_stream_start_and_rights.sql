SET ROLE role_bingo_admin;

------------------------------------------
-- Rounds
------------------------------------------

ALTER TABLE bingo.rounds
    ADD COLUMN IF NOT EXISTS stream_start_at timestamp with time zone DEFAULT null;


------------------------------------------
-- Streams
------------------------------------------

ALTER TABLE bingo.users
    ADD COLUMN IF NOT EXISTS rights text DEFAULT '';
