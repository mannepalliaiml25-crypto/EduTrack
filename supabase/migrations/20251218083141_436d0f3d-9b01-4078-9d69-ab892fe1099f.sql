-- Create attendance_registrations table for students to register their presence
CREATE TABLE public.attendance_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject TEXT NOT NULL,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance_registrations ENABLE ROW LEVEL SECURITY;

-- Students can register their own attendance
CREATE POLICY "Students can create their own registrations"
ON public.attendance_registrations
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Students can view their own registrations
CREATE POLICY "Students can view their own registrations"
ON public.attendance_registrations
FOR SELECT
USING (auth.uid() = student_id);

-- Lecturers can view all registrations
CREATE POLICY "Lecturers can view all registrations"
ON public.attendance_registrations
FOR SELECT
USING (has_role(auth.uid(), 'lecturer'::user_role));

-- Lecturers can update registrations (to mark as confirmed)
CREATE POLICY "Lecturers can update registrations"
ON public.attendance_registrations
FOR UPDATE
USING (has_role(auth.uid(), 'lecturer'::user_role));

-- Add index for performance
CREATE INDEX idx_attendance_registrations_date ON public.attendance_registrations(registration_date);
CREATE INDEX idx_attendance_registrations_student ON public.attendance_registrations(student_id);