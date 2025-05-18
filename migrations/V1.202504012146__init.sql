DO $$
BEGIN
CREATE ROLE  role_bingo_admin;
GRANT USAGE, CREATE  ON SCHEMA  bingo TO role_bingo_admin;
EXCEPTION WHEN duplicate_object THEN RAISE NOTICE '%, skipping', SQLERRM USING ERRCODE = SQLSTATE;
END
$$;


DO $$
BEGIN
CREATE ROLE role_bingo_app;
GRANT USAGE  ON SCHEMA bingo TO role_bingo_app;
EXCEPTION WHEN duplicate_object THEN RAISE NOTICE '%, skipping', SQLERRM USING ERRCODE = SQLSTATE;
END
$$;

DO $$
BEGIN
CREATE USER bingo_backend;
GRANT role_bingo_app TO bingo_backend;
EXCEPTION WHEN duplicate_object THEN RAISE NOTICE '%, skipping', SQLERRM USING ERRCODE = SQLSTATE;
END
$$;
