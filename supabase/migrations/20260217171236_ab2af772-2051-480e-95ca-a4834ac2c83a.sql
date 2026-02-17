
-- Allow lecturers to view all profiles (to see student usernames/emails)
CREATE POLICY "Lecturers can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'lecturer'::user_role));

-- Allow lecturers to view all user_roles (to identify students)
CREATE POLICY "Lecturers can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'lecturer'::user_role));
