import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  LogOut,
  ArrowLeft,
  Send,
  Brain
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StudyRecommendations } from "@/components/StudyRecommendations";
import { supabase } from "@/integrations/supabase/client";
import { AdaptiveQuiz } from "@/components/AdaptiveQuiz";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AttendanceRequest {
  id: string;
  subject: string;
  request_date: string;
  reason: string | null;
  status: string;
  created_at: string;
}

const StudentDashboard = () => {
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [myRequests, setMyRequests] = useState<AttendanceRequest[]>([]);
  const [subject, setSubject] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  
  // Mock data
  const attendancePercentage = 72;
  const requiredPercentage = 75;
  const performanceScore = 78;

  const fetchMyRequests = async () => {
    const { data, error } = await supabase
      .from('attendance_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching requests:', error);
      return;
    }

    setMyRequests(data || []);
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleSubmitRequest = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('attendance_requests')
      .insert({
        student_id: user?.id,
        subject: subject.trim(),
        reason: reason.trim() || null
      });

    if (error) {
      toast.error('Failed to submit request');
      console.error('Error submitting request:', error);
    } else {
      toast.success('Attendance request submitted!');
      setSubject("");
      setReason("");
      setShowRequestDialog(false);
      fetchMyRequests();
    }
    setLoading(false);
  };

  const pendingCount = myRequests.filter(r => r.status === 'pending').length;

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
                <span className="text-3xl font-bold">{pendingCount}</span>
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-medium transition-shadow">
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
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">Create Request</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Attendance Request</DialogTitle>
                    <DialogDescription>
                      Request attendance approval for a missed class
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="subject">Subject / Class Name</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Data Structures"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason (optional)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Why did you miss the class?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleSubmitRequest}
                      disabled={loading}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => setShowAIRecommendations(true)}>
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

          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => setShowQuiz(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Adaptive Quiz
              </CardTitle>
              <CardDescription>
                Test your knowledge with AI-generated questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations Section */}
        {showAIRecommendations && (
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => setShowAIRecommendations(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <StudyRecommendations />
          </div>
        )}

        {/* Adaptive Quiz Section */}
        {showQuiz && (
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => setShowQuiz(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <AdaptiveQuiz />
          </div>
        )}

        {/* My Requests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Attendance Requests</CardTitle>
            <CardDescription>Your recent attendance requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No requests submitted yet</p>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {request.status === 'approved' ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : request.status === 'denied' ? (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <Clock className="w-5 h-5 text-warning" />
                      )}
                      <div>
                        <p className="font-medium">{request.subject}</p>
                        <p className="text-sm text-muted-foreground">{request.request_date}</p>
                        {request.reason && (
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        request.status === 'approved' ? 'default' : 
                        request.status === 'denied' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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