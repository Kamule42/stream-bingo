SET ROLE role_bingo_admin;

CREATE OR REPLACE FUNCTION bingo.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------------------------
-- Streams
------------------------------------------

CREATE TABLE IF NOT EXISTS bingo.streams(
    id UUID PRIMARY KEY,
    name text,
    twitch_login text NOT NULL UNIQUE,
    twitch_id text,
    enabled boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT null,
    deleted_at timestamp with time zone DEFAULT null
);
CREATE OR REPLACE TRIGGER on_streams_update
    BEFORE UPDATE ON bingo.streams
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();
GRANT select, update, insert, delete ON bingo.streams TO role_bingo_app;

------------------------------------------
-- Rounds
------------------------------------------

CREATE TABLE IF NOT EXISTS bingo.rounds(
    id UUID PRIMARY KEY,
    name text,
    stream_id UUID NOT NULL REFERENCES bingo.streams(id),
    start_at timestamp with time zone DEFAULT null,

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT null,
    deleted_at timestamp with time zone DEFAULT null
);
CREATE OR REPLACE TRIGGER on_rounds_update
    BEFORE UPDATE ON bingo.rounds
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();
GRANT select, update, insert, delete ON bingo.rounds TO role_bingo_app;

------------------------------------------
-- Cells
------------------------------------------

CREATE TABLE IF NOT EXISTS bingo.cells(
    id UUID PRIMARY KEY,
    stream_id UUID NOT NULL REFERENCES bingo.streams(id)
        ON DELETE CASCADE 
    ,
    name text NOT NULL,
    description text,
    active boolean,

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT null,
    deleted_at timestamp with time zone DEFAULT null
);
CREATE OR REPLACE TRIGGER on_cells_update
    BEFORE UPDATE ON bingo.cells
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();
GRANT select, update, insert, delete ON bingo.cells TO role_bingo_app;

------------------------------------------
-- Grids
------------------------------------------

CREATE TABLE IF NOT EXISTS bingo.grids(
    id UUID PRIMARY KEY,
    round_id UUID NOT NULL REFERENCES bingo.rounds(id)
        ON DELETE CASCADE 
    ,
    user_id UUID NULL REFERENCES bingo.users(id)
        ON DELETE CASCADE 
    ,
    locked boolean DEFAULT false,

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT null,
    deleted_at timestamp with time zone DEFAULT null,
    UNIQUE(round_id, user_id)
);
CREATE OR REPLACE TRIGGER on_grids_update
    BEFORE UPDATE ON bingo.grids
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();
GRANT select, update, insert, delete ON bingo.grids TO role_bingo_app;

------------------------------------------
-- Grids - cells
------------------------------------------

CREATE TABLE IF NOT EXISTS bingo.grid_cells(
    grid_id UUID NOT NULL REFERENCES bingo.grids(id)
        ON DELETE CASCADE 
    ,
    cell_id UUID NOT NULL REFERENCES bingo.cells(id)
        ON DELETE CASCADE 
    ,
    index int NOT NULL,

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT null,
    deleted_at timestamp with time zone DEFAULT null,
    UNIQUE (grid_id, cell_id, index)
);
CREATE OR REPLACE TRIGGER on_grid_cells_update
    BEFORE UPDATE ON bingo.grid_cells
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();
GRANT select, update, insert, delete ON bingo.grid_cells TO role_bingo_app;

------------------------------------------
-- validated_cells
------------------------------------------

CREATE TABLE IF NOT EXISTS bingo.validated_cells(
    round_id UUID NOT NULL REFERENCES bingo.rounds(id)
        ON DELETE CASCADE 
    ,
    cell_id UUID NOT NULL REFERENCES bingo.cells(id)
        ON DELETE CASCADE 
    ,
    valide boolean NOT NULL default false,

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT null,
    deleted_at timestamp with time zone DEFAULT null,
    UNIQUE (round_id, cell_id)
);
CREATE OR REPLACE TRIGGER on_validated_cells_update
    BEFORE UPDATE ON bingo.validated_cells
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();
GRANT select, update, insert, delete ON bingo.validated_cells TO role_bingo_app;

