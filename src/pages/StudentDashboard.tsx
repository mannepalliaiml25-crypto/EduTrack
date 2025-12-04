import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  
  // Mock data
  const attendancePercentage = 72;
  const requiredPercentage = 75;
  const performanceScore = 78;

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
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.user_metadata?.full_name || 'Student'}!</h2>
          <p className="text-muted-foreground">Here's your academic overview</p>
        </div>

        {/* Attendance Alert */}
        {attendancePercentage < requiredPercentage && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardContent className="flex items-center gap-4 p-4">
              <AlertCircle className="w-6 h-6 text-warning" />
              <div className="flex-1">
                <p className="font-semibold text-warning">Attendance Alert</p>
                <p className="text-sm text-muted-foreground">
                  Your attendance is below {requiredPercentage}%. Attend more classes to meet the requirement.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">{attendancePercentage}%</span>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <Progress value={attendancePercentage} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">{performanceScore}%</span>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <Progress value={performanceScore} className="h-2 [&>div]:bg-success" />
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
                <span className="text-3xl font-bold">2</span>
                <Clock className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bloom's Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-lg px-3 py-1">Level 3</Badge>
                <Target className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Applying</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Request Attendance
              </CardTitle>
              <CardDescription>
                Submit attendance request for missed classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create Request</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                AI Study Materials
              </CardTitle>
              <CardDescription>
                Get personalized learning resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Explore Materials
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your last 5 attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Dec 1, 2025", subject: "Data Structures", status: "present" },
                { date: "Nov 30, 2025", subject: "Algorithms", status: "present" },
                { date: "Nov 29, 2025", subject: "Database Systems", status: "absent" },
                { date: "Nov 28, 2025", subject: "Web Development", status: "present" },
                { date: "Nov 27, 2025", subject: "Machine Learning", status: "present" },
              ].map((record, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    {record.status === "present" ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">{record.subject}</p>
                      <p className="text-sm text-muted-foreground">{record.date}</p>
                    </div>
                  </div>
                  <Badge variant={record.status === "present" ? "default" : "destructive"}>
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;
