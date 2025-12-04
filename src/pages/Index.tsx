import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

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
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Smart Attendance &{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Performance Tracking
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered platform for colleges to track attendance, monitor performance, 
            and personalize learning with Bloom's taxonomy-based recommendations.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card 
            className="group relative overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-strong"
            onClick={() => navigate("/auth?role=student")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-medium">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Student Portal</h3>
                <p className="text-muted-foreground">
                  Track your attendance, view performance insights, get AI study recommendations, 
                  and take personalized quizzes.
                </p>
              </div>
              <Button className="w-full group-hover:scale-105 transition-transform">
                Continue as Student
              </Button>
            </div>
          </Card>

          <Card 
            className="group relative overflow-hidden border-2 border-border hover:border-accent transition-all duration-300 cursor-pointer hover:shadow-strong"
            onClick={() => navigate("/auth?role=lecturer")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-warning/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-8 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-warning flex items-center justify-center shadow-medium">
                <Users className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Lecturer Portal</h3>
                <p className="text-muted-foreground">
                  Mark attendance, manage student requests, track class performance, 
                  and monitor individual student progress.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground group-hover:scale-105 transition-transform"
              >
                Continue as Lecturer
              </Button>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Two-Way Attendance",
              description: "Students can request and lecturers can directly mark attendance with real-time notifications.",
              icon: "📋"
            },
            {
              title: "AI Study Materials",
              description: "Get personalized learning resources based on your Bloom's taxonomy level and understanding.",
              icon: "🤖"
            },
            {
              title: "Smart Quizzes",
              description: "Take adaptive quizzes with questions arranged by difficulty to test your knowledge progression.",
              icon: "📝"
            }
          ].map((feature, i) => (
            <Card key={i} className="p-6 hover:shadow-medium transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
