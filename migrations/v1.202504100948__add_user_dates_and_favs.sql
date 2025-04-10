SET ROLE role_bingo_admin;


------------------------------------------
-- Update users
------------------------------------------

ALTER TABLE bingo.users
    ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT null,
    ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT null;
CREATE OR REPLACE TRIGGER on_users_update
    BEFORE UPDATE ON bingo.users
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();



------------------------------------------
-- Favs
------------------------------------------

CREATE TABLE IF NOT EXISTS bingo.favs(
    user_id UUID REFERENCES bingo.users(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    stream_id UUID REFERENCES bingo.streams(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    UNIQUE(user_id, stream_id)
);
GRANT select, insert, delete ON bingo.favs TO role_bingo_app;

