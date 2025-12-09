import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy,
  Loader2,
  RotateCcw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  bloomLevel: number;
  bloomName: string;
}

interface QuizResult {
  level: number;
  levelName: string;
  correct: boolean;
}

const bloomLevelColors: Record<number, string> = {
  1: "bg-blue-500",
  2: "bg-green-500",
  3: "bg-yellow-500",
  4: "bg-orange-500",
  5: "bg-red-500",
  6: "bg-purple-500"
};

const bloomLevelNames: Record<number, string> = {
  1: "Remember",
  2: "Understand",
  3: "Apply",
  4: "Analyze",
  5: "Evaluate",
  6: "Create"
};

export const AdaptiveQuiz = () => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [highestLevel, setHighestLevel] = useState(0);

  const startQuiz = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    setQuizStarted(true);
    setCurrentLevel(1);
    setResults([]);
    setHighestLevel(0);
    setQuizComplete(false);
    await fetchQuestion(1);
  };

  const fetchQuestion = async (level: number) => {
    setLoading(true);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { subject, bloomLevel: level, topic: topic.trim() || undefined }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setCurrentQuestion(data);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error("Failed to generate question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    setShowResult(true);

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    const newResult: QuizResult = {
      level: currentLevel,
      levelName: bloomLevelNames[currentLevel],
      correct: isCorrect
    };
    setResults(prev => [...prev, newResult]);

    if (isCorrect) {
      setHighestLevel(Math.max(highestLevel, currentLevel));
      toast.success(`Correct! You've mastered ${bloomLevelNames[currentLevel]} level!`);
    } else {
      toast.error("Incorrect. Review the explanation below.");
    }
  };

  const nextQuestion = async () => {
    const isCorrect = selectedAnswer === currentQuestion?.correctIndex;
    
    if (isCorrect && currentLevel < 6) {
      // Move up to next Bloom's level
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      await fetchQuestion(nextLevel);
    } else if (!isCorrect && currentLevel > 1) {
      // Stay at same level or drop down
      await fetchQuestion(currentLevel);
    } else if (!isCorrect && currentLevel === 1) {
      // Stay at level 1
      await fetchQuestion(1);
    } else if (isCorrect && currentLevel === 6) {
      // Completed all levels!
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizComplete(false);
    setCurrentLevel(1);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setResults([]);
    setHighestLevel(0);
  };

  if (quizComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>
            Congratulations! You've mastered all Bloom's Taxonomy levels!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-2">Highest Level Achieved:</p>
            <Badge className={`${bloomLevelColors[highestLevel]} text-white text-lg px-4 py-2`}>
              Level {highestLevel}: {bloomLevelNames[highestLevel]}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Your Journey:</p>
            <div className="flex flex-wrap gap-2">
              {results.map((result, i) => (
                <Badge 
                  key={i} 
                  variant={result.correct ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {result.correct ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {result.levelName}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={resetQuiz} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start New Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Adaptive Quiz System
          </CardTitle>
          <CardDescription>
            Test your knowledge with AI-generated questions that adapt to your cognitive level
            based on Bloom's Taxonomy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Data Structures, Algorithms, Machine Learning"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="topic">Specific Topic (optional)</Label>
              <Input
                id="topic"
                placeholder="e.g., Binary Trees, Sorting Algorithms"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="font-medium mb-3">Bloom's Taxonomy Levels:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(bloomLevelNames).map(([level, name]) => (
                <div key={level} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${bloomLevelColors[Number(level)]}`} />
                  <span className="text-sm">{level}. {name}</span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={startQuiz} className="w-full" disabled={!subject.trim()}>
            Start Adaptive Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className={`${bloomLevelColors[currentLevel]} text-white`}>
            Level {currentLevel}: {bloomLevelNames[currentLevel]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {subject} {topic && `• ${topic}`}
          </span>
        </div>
        <Progress value={(currentLevel / 6) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          Progress through Bloom's Taxonomy
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating {bloomLevelNames[currentLevel]}-level question...</p>
          </div>
        ) : currentQuestion ? (
          <>
            <div>
              <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      selectedAnswer === index
                        ? showResult
                          ? index === currentQuestion.correctIndex
                            ? "border-success bg-success/10"
                            : "border-destructive bg-destructive/10"
                          : "border-primary bg-primary/10"
                        : showResult && index === currentQuestion.correctIndex
                          ? "border-success bg-success/10"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {showResult && index === currentQuestion.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
                      )}
                      {showResult && selectedAnswer === index && index !== currentQuestion.correctIndex && (
                        <XCircle className="w-5 h-5 text-destructive ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {showResult && (
              <div className={`p-4 rounded-lg ${
                selectedAnswer === currentQuestion.correctIndex 
                  ? "bg-success/10 border border-success" 
                  : "bg-destructive/10 border border-destructive"
              }`}>
                <p className="font-medium mb-1">
                  {selectedAnswer === currentQuestion.correctIndex ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex gap-4">
              {!showResult ? (
                <Button 
                  onClick={submitAnswer} 
                  className="w-full" 
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="w-full">
                  {selectedAnswer === currentQuestion.correctIndex && currentLevel < 6
                    ? `Next Level: ${bloomLevelNames[currentLevel + 1]}`
                    : selectedAnswer === currentQuestion.correctIndex && currentLevel === 6
                      ? "Complete Quiz"
                      : "Try Again at This Level"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={resetQuiz}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart Quiz
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};
