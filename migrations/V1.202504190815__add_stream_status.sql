SET ROLE role_bingo_admin;


------------------------------------------
-- Add round status
------------------------------------------
DO $$ BEGIN
    CREATE TYPE bingo.round_status AS ENUM
    	('CREATED', 'STARTED', 'FINISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


ALTER TABLE IF EXISTS bingo.rounds
    ADD COLUMN IF NOT EXISTS status bingo.round_status DEFAULT 'CREATED';

CREATE UNIQUE INDEX round_started_ix ON bingo.rounds (stream_id, status)
    WHERE (status = 'STARTED');
