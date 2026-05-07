-- Tighten SELECT policies: remove public access
DROP POLICY IF EXISTS "Anyone can view published students" ON public.students;
DROP POLICY IF EXISTS "Anyone can view subjects" ON public.student_subjects;

CREATE POLICY "Admins can view all students"
ON public.students FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all subjects"
ON public.student_subjects FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Secure lookup: verify register + dob, return id only if published
CREATE OR REPLACE FUNCTION public.lookup_student_id(_register_number text, _dob date)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.students
  WHERE register_number = _register_number
    AND dob = _dob
    AND is_published = true
  LIMIT 1;
$$;

-- Returns full result (student info + subjects) only when reg + dob match and published
CREATE OR REPLACE FUNCTION public.get_student_result(_register_number text, _dob date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _student_id uuid;
  _result jsonb;
BEGIN
  SELECT id INTO _student_id
  FROM public.students
  WHERE register_number = _register_number
    AND dob = _dob
    AND is_published = true
  LIMIT 1;

  IF _student_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'register_number', s.register_number,
    'class_name', c.name,
    'subjects', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'subject', ss.subject,
        'marks', ss.marks,
        'grade', ss.grade
      ) ORDER BY ss.subject)
      FROM public.student_subjects ss
      WHERE ss.student_id = s.id
    ), '[]'::jsonb)
  )
  INTO _result
  FROM public.students s
  LEFT JOIN public.classes c ON c.id = s.class_id
  WHERE s.id = _student_id;

  RETURN _result;
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_student_id(text, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_student_id(text, date) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.get_student_result(text, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_student_result(text, date) TO anon, authenticated;