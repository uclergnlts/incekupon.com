-- Existing databases: allow multi-selection predictions such as 1-0, 1-2, 0-2, 1-0-2
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'spor_toto_matches'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%prediction%'
  LOOP
    EXECUTE format('ALTER TABLE spor_toto_matches DROP CONSTRAINT %I', c.conname);
  END LOOP;
END;
$$;

ALTER TABLE spor_toto_matches
  ADD CONSTRAINT spor_toto_matches_prediction_check
  CHECK (prediction ~ '^(1|0|2)(-(1|0|2)){0,2}$');
