-- Fill older Spor Toto weeks up to 15 matches (idempotent)
WITH week_numbers AS (
  SELECT w.id AS week_id, gs.n AS match_number
  FROM spor_toto_weeks w
  CROSS JOIN generate_series(1, 15) AS gs(n)
),
missing AS (
  SELECT wn.week_id, wn.match_number
  FROM week_numbers wn
  LEFT JOIN spor_toto_matches m
    ON m.week_id = wn.week_id
   AND m.match_number = wn.match_number
  WHERE m.id IS NULL
)
INSERT INTO spor_toto_matches (
  week_id,
  match_number,
  home_team,
  away_team,
  prediction,
  actual_result
)
SELECT
  missing.week_id,
  missing.match_number,
  'TBD',
  'TBD',
  '1',
  NULL
FROM missing;
