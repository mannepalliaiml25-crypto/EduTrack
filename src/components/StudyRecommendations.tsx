import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, BookOpen, Target, Brain, AlertTriangle, Sparkles, Clock, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Recommendation {
  title: string;
  type: string;
  description: string;
  bloomsLevel: number;
  estimatedTime: string;
}

interface PracticeActivity {
  activity: string;
  description: string;
  bloomsLevel: number;
}

interface StudyRecommendationsData {
  recommendations: Recommendation[];
  strategies: string[];
  practiceActivities: PracticeActivity[];
  foundationalReview: string[];
  currentLevel: { level: number; name: string; description: string };
  nextLevel: { level: number; name: string; description: string } | null;
}

const BLOOMS_COLORS: Record<number, string> = {
  1: 'bg-red-500/20 text-red-700 border-red-500/30',
  2: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  3: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  4: 'bg-green-500/20 text-green-700 border-green-500/30',
  5: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  6: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
};

const BLOOMS_NAMES: Record<number, string> = {
  1: 'Remember',
  2: 'Understand',
  3: 'Apply',
  4: 'Analyze',
  5: 'Evaluate',
  6: 'Create',
};

export function StudyRecommendations() {
  const [subject, setSubject] = useState('');
  const [currentLevel, setCurrentLevel] = useState(2);
  const [performanceScore, setPerformanceScore] = useState(75);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudyRecommendationsData | null>(null);

  const getRecommendations = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('study-recommendations', {
        body: {
          subject,
          currentLevel,
          performanceScore,
          topics: subject.split(',').map(t => t.trim()),
        },
      });

      if (error) throw error;
      
      if (response.error) {
        toast.error(response.error);
        return;
      }

      setData(response);
      toast.success('Recommendations generated!');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast.error('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Study Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized study materials based on your Bloom's taxonomy level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject/Topic</Label>
              <Input
                id="subject"
                placeholder="e.g., Machine Learning, Physics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Current Bloom's Level</Label>
              <select
                id="level"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <option key={level} value={level}>
                    {level}. {BLOOMS_NAMES[level]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="performance">Performance Score (%)</Label>
              <Input
                id="performance"
                type="number"
                min={0}
                max={100}
                value={performanceScore}
                onChange={(e) => setPerformanceScore(Number(e.target.value))}
              />
            </div>
          </div>
          <Button onClick={getRecommendations} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Get AI Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {data && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Level Info */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Your Learning Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Level</span>
                  <Badge className={BLOOMS_COLORS[data.currentLevel.level]}>
                    {data.currentLevel.level}. {data.currentLevel.name}
                  </Badge>
                </div>
                <p className="text-sm">{data.currentLevel.description}</p>
                {data.nextLevel && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Next Goal: </span>
                    <Badge variant="outline" className="ml-2">
                      {data.nextLevel.level}. {data.nextLevel.name}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Strategies */}
          <Card className="border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                Learning Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.strategies?.slice(0, 4).map((strategy, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Study Materials */}
          <Card className="md:col-span-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Recommended Study Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.type}
                      </Badge>
                      <Badge className={BLOOMS_COLORS[rec.bloomsLevel] || BLOOMS_COLORS[2]}>
                        L{rec.bloomsLevel}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    {rec.estimatedTime && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {rec.estimatedTime}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Practice Activities */}
          {data.practiceActivities?.length > 0 && (
            <Card className="border-warning/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-warning" />
                  Practice Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.practiceActivities.map((activity, i) => (
                    <div key={i} className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{activity.activity}</span>
                        <Badge className={BLOOMS_COLORS[activity.bloomsLevel] || BLOOMS_COLORS[2]}>
                          L{activity.bloomsLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning Signs */}
          {data.foundationalReview?.length > 0 && (
            <Card className="border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Review Warning Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.foundationalReview.map((warning, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-destructive mt-1">!</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
