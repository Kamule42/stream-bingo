SET ROLE role_bingo_admin;

CREATE OR REPLACE VIEW bingo.v_stream_leaderboard AS 

SELECT 
  l.user_id,
  l.username,
  r.stream_id as stream_id,
  SUM(l.score) as score
FROM  bingo.v_leaderboard l
LEFT JOIN bingo.rounds r ON r.id = l.round_id
GROUP BY l.user_id, l.username, r.stream_id;


GRANT select ON bingo.v_stream_leaderboard TO role_bingo_app;
