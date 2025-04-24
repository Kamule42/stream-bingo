SET ROLE role_bingo_admin;

CREATE OR REPLACE VIEW bingo.v_leaderboard AS 

SELECT 
  u.id as user_id,
  u.discord_username as username,
  g.id as grid_id,
  g.round_id,
  SUM(g.score) as score
FROM bingo.users u
LEFT JOIN bingo.grids g ON g.user_id = u.id AND g.score is not null
GROUP BY u.id, g.id;


GRANT select ON bingo.v_leaderboard TO role_bingo_app;
