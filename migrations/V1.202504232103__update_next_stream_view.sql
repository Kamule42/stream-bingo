SET ROLE role_bingo_admin;
CREATE OR REPLACE VIEW bingo.v_next_streams AS
SELECT s.id,
  s.name,
  s.twitch_login,
  s.twitch_id,
  s.enabled,
  r.start_at,
  r.status,
  r.stream_start_at
FROM bingo.streams s
  LEFT JOIN lateral (
    SELECT start_at,
      stream_start_at,
      status,
      CASE
        WHEN status = 'STARTED' THEN -1
        ELSE to_char(start_at, 'YYYYMMDDhhMMss')::numeric
      END as "order"
    FROM bingo.rounds
    WHERE s.id = stream_id
      AND status != 'FINISHED'
      AND (
        stream_start_at + interval '3' hour > NOW()
        AND start_at <= NOW()
        OR status = 'STARTED'
      )
    ORDER BY "order" ASC
    LIMIT 1
  ) r ON TRUE
ORDER BY stream_start_at ASC;
GRANT select ON bingo.v_next_streams TO role_bingo_app;