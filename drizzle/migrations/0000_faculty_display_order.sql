ALTER TABLE public.faculties
  ADD COLUMN display_order integer NOT NULL DEFAULT 0;

UPDATE public.faculties AS faculty
SET display_order = ordered.position
FROM (
  SELECT id, row_number() OVER (ORDER BY created_at DESC NULLS LAST, id) AS position
  FROM public.faculties
) AS ordered
WHERE faculty.id = ordered.id;

CREATE OR REPLACE FUNCTION public.set_faculty_display_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.display_order IS NULL OR NEW.display_order <= 0 THEN
    SELECT COALESCE(MAX(display_order), 0) + 1
    INTO NEW.display_order
    FROM public.faculties;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_faculty_display_order_before_insert
BEFORE INSERT ON public.faculties
FOR EACH ROW
EXECUTE FUNCTION public.set_faculty_display_order();

CREATE OR REPLACE FUNCTION public.reorder_faculties(_faculty_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _faculty_count bigint;
  _provided_count bigint;
  _matching_count bigint;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO _faculty_count FROM public.faculties;
  SELECT count(DISTINCT provided.id) INTO _provided_count
  FROM unnest(_faculty_ids) AS provided(id);
  SELECT count(*) INTO _matching_count
  FROM public.faculties AS faculty
  WHERE faculty.id = ANY(_faculty_ids);

  IF _faculty_ids IS NULL
    OR cardinality(_faculty_ids) <> _faculty_count
    OR _provided_count <> _faculty_count
    OR _matching_count <> _faculty_count THEN
    RAISE EXCEPTION 'The supplied order must include every faculty member exactly once' USING ERRCODE = '22023';
  END IF;

  UPDATE public.faculties AS faculty
  SET display_order = ordered.position::integer
  FROM unnest(_faculty_ids) WITH ORDINALITY AS ordered(id, position)
  WHERE faculty.id = ordered.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.reorder_faculties(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reorder_faculties(uuid[]) TO authenticated;