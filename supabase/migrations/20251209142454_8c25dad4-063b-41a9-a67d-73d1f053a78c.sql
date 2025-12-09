-- Create attendance_requests table
CREATE TABLE public.attendance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lecturer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance_requests ENABLE ROW LEVEL SECURITY;

-- Students can view their own requests
CREATE POLICY "Students can view their own requests"
ON public.attendance_requests
FOR SELECT
USING (auth.uid() = student_id);

-- Students can create their own requests
CREATE POLICY "Students can create their own requests"
ON public.attendance_requests
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Lecturers can view all pending requests
CREATE POLICY "Lecturers can view all requests"
ON public.attendance_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'lecturer'));

-- Lecturers can update request status
CREATE POLICY "Lecturers can update requests"
ON public.attendance_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'lecturer'));

-- Create students table for lecturer to mark attendance
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Lecturers can view all students
CREATE POLICY "Lecturers can view all students"
ON public.students
FOR SELECT
USING (public.has_role(auth.uid(), 'lecturer'));

-- Students can view themselves
CREATE POLICY "Students can view themselves"
ON public.students
FOR SELECT
USING (auth.uid() = user_id);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Students can view their own records
CREATE POLICY "Students can view their own records"
ON public.attendance_records
FOR SELECT
USING (auth.uid() = student_id);

-- Lecturers can view all records
CREATE POLICY "Lecturers can view all records"
ON public.attendance_records
FOR SELECT
USING (public.has_role(auth.uid(), 'lecturer'));

-- Lecturers can create records
CREATE POLICY "Lecturers can create records"
ON public.attendance_records
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'lecturer'));

-- Enable realtime for attendance_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_requests;

-- Trigger for updated_at
CREATE TRIGGER update_attendance_requests_updated_at
BEFORE UPDATE ON public.attendance_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();