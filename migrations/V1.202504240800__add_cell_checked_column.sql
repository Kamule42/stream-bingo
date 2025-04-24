SET ROLE role_bingo_admin;

ALTER TABLE IF EXISTS bingo.grid_cells
  ADD COLUMN IF NOT EXISTS checked boolean default false;
