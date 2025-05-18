SET ROLE role_bingo_admin;

ALTER TABLE bingo.users
  RENAME COLUMN discord_username TO username;

ALTER TABLE bingo.users
  DROP COLUMN IF EXISTS discord_id,
  DROP COLUMN IF EXISTS discord_avatar,
  ADD COLUMN IF NOT EXISTS avatar_provider varchar;


CREATE TABLE IF NOT EXISTS bingo.authentication(
  user_id UUID REFERENCES bingo.users(id),
  provider varchar,
  reference varchar,
  avatar_reference text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON bingo.authentication TO role_bingo_app;

CREATE OR REPLACE VIEW bingo.v_leaderboard AS 
SELECT 
  u.id as user_id,
  u.username as username,
  g.id as grid_id,
  g.round_id,
  SUM(g.score) as score
FROM bingo.users u
LEFT JOIN bingo.grids g ON g.user_id = u.id AND g.score is not null
GROUP BY u.id, g.id;
