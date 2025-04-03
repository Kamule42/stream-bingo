CREATE ROLE role_bingo_admin;
GRANT USAGE, CREATE  ON SCHEMA  bingo TO role_bingo_admin;

CREATE ROLE role_bingo_app;
GRANT USAGE  ON SCHEMA bingo TO role_bingo_app;

CREATE USER bingo_backend;
GRANT role_bingo_app TO bingo_backend;
