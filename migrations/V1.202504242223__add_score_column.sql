SET ROLE role_bingo_admin;

ALTER TABLE IF EXISTS bingo.grids
  ADD COLUMN IF NOT EXISTS score numeric NULL default NULL;
