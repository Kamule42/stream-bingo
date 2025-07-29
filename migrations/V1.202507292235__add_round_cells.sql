SET ROLE role_bingo_admin;

ALTER TABLE bingo.rounds
  ADD column cells UUID[] NOT NULL DEFAULT ARRAY[]::UUID[]
  CHECK (array_length(cells, 1) >= grid_size * grid_size);
