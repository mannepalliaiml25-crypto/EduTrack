
-- Table to store marks per student per subject
CREATE TABLE public.student_marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject TEXT NOT NULL,
  marks INTEGER NOT NULL DEFAULT 0,
  max_marks INTEGER NOT NULL DEFAULT 100,
  lecturer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject)
);

ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;

-- Lecturers can do everything
CREATE POLICY "Lecturers can view all marks"
ON public.student_marks FOR SELECT
USING (has_role(auth.uid(), 'lecturer'::user_role));

CREATE POLICY "Lecturers can insert marks"
ON public.student_marks FOR INSERT
WITH CHECK (has_role(auth.uid(), 'lecturer'::user_role));

CREATE POLICY "Lecturers can update marks"
ON public.student_marks FOR UPDATE
USING (has_role(auth.uid(), 'lecturer'::user_role));

CREATE POLICY "Lecturers can delete marks"
ON public.student_marks FOR DELETE
USING (has_role(auth.uid(), 'lecturer'::user_role));

-- Students can view their own marks
CREATE POLICY "Students can view their own marks"
ON public.student_marks FOR SELECT
USING (auth.uid() = student_id);

-- Trigger for updated_at
CREATE TRIGGER update_student_marks_updated_at
BEFORE UPDATE ON public.student_marks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
