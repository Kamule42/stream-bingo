SET ROLE role_bingo_admin;


------------------------------------------
-- Next streams view
------------------------------------------

CREATE OR REPLACE VIEW bingo.v_next_streams AS
    SELECT 
        s.id, s.name, s.twitch_login, s.twitch_id,s.enabled,
        MIN(r.stream_start_at) AS start_at
    FROM bingo.streams s
    LEFT JOIN bingo.rounds r ON s.id = r.stream_id AND r.stream_start_at > NOW() AND r.start_at <= NOW()
    GROUP BY s.id
    ORDER BY start_at ASC;
GRANT select ON bingo.v_next_streams TO role_bingo_app;
