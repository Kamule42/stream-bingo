SET ROLE role_bingo_admin;

CREATE TABLE IF NOT EXISTS bingo.users(
    id uuid primary key,
    discord_id text unique ,
    discord_username text,
    discord_avatar text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON bingo.users TO role_bingo_app;
