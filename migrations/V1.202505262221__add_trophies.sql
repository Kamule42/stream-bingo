SET ROLE role_bingo_admin;

CREATE TABLE IF NOT EXISTS bingo.trophies(
  id UUID PRIMARY KEY,
  image_key varchar(50),
  name text
);
GRANT select, update, insert, delete ON bingo.trophies TO role_bingo_app;

CREATE TABLE IF NOT EXISTS bingo.user_trophies(
  user_id UUID NOT NULL REFERENCES bingo.users(id),
  trophy_id UUID NOT NULL REFERENCES bingo.trophies(id),
  stream_id UUID NULL REFERENCES bingo.streams(id)
);
GRANT select, update, insert, delete ON bingo.user_trophies TO role_bingo_app;
