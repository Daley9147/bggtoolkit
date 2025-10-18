CREATE OR REPLACE FUNCTION get_high_scores()
RETURNS TABLE (
    full_name TEXT,
    max_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.full_name,
        MAX(ss.score) AS max_score
    FROM
        snake_scores ss
    JOIN
        profiles p ON ss.user_id = p.id
    GROUP BY
        p.full_name
    ORDER BY
        max_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
