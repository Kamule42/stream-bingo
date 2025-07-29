SET ROLE role_bingo_admin;

ALTER TABLE bingo.rounds
  ADD column grid_size smallint NOT NULL default 4 CHECK (grid_size > 0 AND grid_size <= 15);
