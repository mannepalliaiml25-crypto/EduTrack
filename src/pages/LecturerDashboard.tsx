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
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const LecturerDashboard = () => {
  const { user, signOut } = useAuth();

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
                <span className="text-3xl font-bold">156</span>
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
                <span className="text-3xl font-bold">8</span>
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
              <Button className="w-full">Start Marking</Button>
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
            <div className="space-y-4">
              {[
                { name: "John Doe", subject: "Data Structures", date: "Nov 29, 2025", reason: "Medical emergency" },
                { name: "Jane Smith", subject: "Algorithms", date: "Nov 28, 2025", reason: "Family event" },
                { name: "Mike Johnson", subject: "Web Development", date: "Nov 27, 2025", reason: "Technical issues" },
              ].map((request, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{request.name}</p>
                      <Badge variant="outline">{request.subject}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{request.date}</p>
                    <p className="text-sm">{request.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-success text-success hover:bg-success hover:text-success-foreground">
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
