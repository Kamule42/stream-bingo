CREATE ROLE IF NOT EXISTS role_bingo_admin;
GRANT CREATE ON bingo.* TO role_bingo_admin;

CREATE ROLE IF NOT EXISTS role_bingo_app;

CREATE USER IF NOT EXISTS bingo_backend;
GRANT role_bingo_app TO bingo_backend;
