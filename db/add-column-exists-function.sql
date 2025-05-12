-- Create a function to check if a column exists in a table
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  exists_bool boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = $1
    AND column_name = $2
  ) INTO exists_bool;
  
  RETURN exists_bool;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION column_exists(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION column_exists(text, text) TO service_role;
