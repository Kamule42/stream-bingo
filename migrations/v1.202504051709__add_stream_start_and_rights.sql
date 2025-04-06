SET ROLE role_bingo_admin;

------------------------------------------
-- Rounds
------------------------------------------

ALTER TABLE bingo.rounds
    ADD COLUMN IF NOT EXISTS stream_start_at timestamp with time zone DEFAULT null;


------------------------------------------
-- Rights
------------------------------------------

CREATE TABLE IF NOT EXISTS bingo.rights(
    user_id UUID not null REFERENCES bingo.users(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    stream_id UUID null REFERENCES bingo.streams(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    right_key varchar(4),

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT null,
    deleted_at timestamp with time zone DEFAULT null,

    UNIQUE(user_id, stream_id, right_key)
);
CREATE OR REPLACE TRIGGER onrights_cells_update
    BEFORE UPDATE ON bingo.rights
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();
GRANT select, update, insert, delete ON bingo.rights TO role_bingo_app;
