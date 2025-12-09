import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2,
  Clock,
  UserCheck,
  GraduationCap,
  LogOut,
  ArrowLeft,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface AttendanceRequest {
  id: string;
  student_id: string;
  subject: string;
  request_date: string;
  reason: string | null;
  status: string;
  created_at: string;
  student_name?: string;
}

interface StudentProfile {
  user_id: string;
  full_name: string;
  email: string;
}

const LecturerDashboard = () => {
  const { user, signOut } = useAuth();
  const [showMarkingView, setShowMarkingView] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<AttendanceRequest[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    const { data: requests, error } = await supabase
      .from('attendance_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      return;
    }

    // Get student names from profiles
    if (requests && requests.length > 0) {
      const studentIds = requests.map(r => r.student_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', studentIds);

      const requestsWithNames = requests.map(request => ({
        ...request,
        student_name: profiles?.find(p => p.user_id === request.student_id)?.full_name || 'Unknown Student'
      }));

      setPendingRequests(requestsWithNames);
    } else {
      setPendingRequests([]);
    }
  };

  // Fetch all students (profiles with student role)
  const fetchStudents = async () => {
    const { data: studentRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student');

    if (rolesError) {
      console.error('Error fetching student roles:', rolesError);
      return;
    }

    if (studentRoles && studentRoles.length > 0) {
      const studentIds = studentRoles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const studentProfiles = profiles?.filter(p => studentIds.includes(p.user_id)) || [];
      setStudents(studentProfiles);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchStudents();

    // Subscribe to realtime updates for attendance requests
    const channel = supabase
      .channel('attendance-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_requests'
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApproveRequest = async (requestId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('attendance_requests')
      .update({ status: 'approved', lecturer_id: user?.id })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to approve request');
      console.error('Error approving request:', error);
    } else {
      toast.success('Attendance request approved!');
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    }
    setLoading(false);
  };

  const handleDenyRequest = async (requestId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('attendance_requests')
      .update({ status: 'denied', lecturer_id: user?.id })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to deny request');
      console.error('Error denying request:', error);
    } else {
      toast.success('Attendance request denied');
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    }
    setLoading(false);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleMarkAttendance = async () => {
    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setLoading(true);
    const records = Array.from(selectedStudents).map(studentId => ({
      student_id: studentId,
      lecturer_id: user?.id,
      subject: 'General Class',
      status: 'present'
    }));

    const { error } = await supabase
      .from('attendance_records')
      .insert(records);

    if (error) {
      toast.error('Failed to mark attendance');
      console.error('Error marking attendance:', error);
    } else {
      toast.success(`Attendance marked for ${selectedStudents.size} student(s)!`);
      setSelectedStudents(new Set());
      setShowMarkingView(false);
    }
    setLoading(false);
  };

  if (showMarkingView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <header className="border-b border-border/40 backdrop-blur-sm bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EduTrack
              </h1>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setShowMarkingView(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Mark Attendance
              </CardTitle>
              <CardDescription>Select students to mark as present</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No students registered yet</p>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div 
                      key={student.user_id} 
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => toggleStudentSelection(student.user_id)}
                    >
                      <Checkbox 
                        checked={selectedStudents.has(student.user_id)}
                        onCheckedChange={() => toggleStudentSelection(student.user_id)}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      {selectedStudents.has(student.user_id) && (
                        <Badge variant="default" className="bg-success">Selected</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {students.length > 0 && (
                <div className="mt-6 flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setSelectedStudents(new Set())}>
                    Clear Selection
                  </Button>
                  <Button onClick={handleMarkAttendance} disabled={loading || selectedStudents.size === 0}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark {selectedStudents.size} Present
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EduTrack
            </h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.user_metadata?.full_name || 'Professor'}!</h2>
          <p className="text-muted-foreground">Manage your classes and student performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{students.length}</span>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Classes Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">4</span>
                <Calendar className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{pendingRequests.length}</span>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">82%</span>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Mark Attendance
              </CardTitle>
              <CardDescription>
                Mark attendance for your current class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setShowMarkingView(true)}>
                Start Marking
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Review Requests
              </CardTitle>
              <CardDescription>
                Review pending attendance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                View Requests
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Attendance Requests</CardTitle>
            <CardDescription>Students requesting attendance approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{request.student_name}</p>
                        <Badge variant="outline">{request.subject}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{request.request_date}</p>
                      <p className="text-sm">{request.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-success text-success hover:bg-success hover:text-success-foreground"
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={loading}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDenyRequest(request.id)}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
            <CardDescription>Average performance by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { subject: "Data Structures", avgScore: 85, avgAttendance: 88 },
                { subject: "Algorithms", avgScore: 78, avgAttendance: 82 },
                { subject: "Database Systems", avgScore: 82, avgAttendance: 79 },
                { subject: "Web Development", avgScore: 90, avgAttendance: 85 },
              ].map((classData, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">{classData.subject}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Score: <span className="text-foreground font-medium">{classData.avgScore}%</span>
                      </span>
                      <span className="text-muted-foreground">
                        Attendance: <span className="text-foreground font-medium">{classData.avgAttendance}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LecturerDashboard;