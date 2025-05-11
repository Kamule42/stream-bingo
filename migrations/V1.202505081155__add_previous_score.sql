SET ROLE role_bingo_admin;

CREATE TABLE IF NOT EXISTS bingo.score_baseline(
  user_id UUID references bingo.users(id),
  stream_id UUID NOT NULL REFERENCES bingo.streams(id),
  score int,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT null,
  deleted_at timestamp with time zone DEFAULT null,
  UNIQUE(stream_id, user_id)
);
CREATE OR REPLACE TRIGGER on_score_baseline_update
    BEFORE UPDATE ON bingo.score_baseline
    FOR EACH ROW
    EXECUTE FUNCTION bingo.set_updated_at();
GRANT select ON bingo.score_baseline TO role_bingo_app;

CREATE OR REPLACE VIEW bingo.v_stream_leaderboard AS 
WITH bingoScores as (
  SELECT 
    l.user_id,
    l.username,
    r.stream_id,
    SUM(l.score) as score
  FROM  bingo.v_leaderboard l
  LEFT JOIN bingo.rounds r ON r.id = l.round_id
  GROUP BY l.user_id, l.username, r.stream_id
)
SELECT 
  s.user_id,
  s.username,
  s.stream_id,
  s.score + coalesce(b.score, 0) as score
FROM bingoScores s
LEFT JOIN bingo.score_baseline b ON b.user_id = s.user_id AND b.stream_id = s.stream_id;


GRANT select ON bingo.v_stream_leaderboard TO role_bingo_app;
