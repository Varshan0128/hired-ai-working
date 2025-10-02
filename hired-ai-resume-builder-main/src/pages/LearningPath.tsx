import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PsychologyTest from '@/components/psychology/PsychologyTest';
import TestResults from '@/components/psychology/TestResults';

const LearningPath: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<string[]>([]);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('learning_path_courses') || '[]');
    setCourses(existing);
    
    // Check if psychology test is completed
    const completed = localStorage.getItem('psychology_test_completed') === 'true';
    setTestCompleted(completed);
  }, []);

  const clearCourses = () => {
    localStorage.removeItem('learning_path_courses');
    setCourses([]);
  };

  const handleTestComplete = (result: any) => {
    setTestResult(result);
    setShowResults(true);
    localStorage.setItem('psychology_test_result', JSON.stringify(result));
  };

  const handleContinueToLearningPath = () => {
    localStorage.setItem('psychology_test_completed', 'true');
    setTestCompleted(true);
    setShowResults(false);
  };

  const resetTest = () => {
    localStorage.removeItem('psychology_test_completed');
    localStorage.removeItem('psychology_test_result');
    setTestCompleted(false);
    setShowResults(false);
    setTestResult(null);
  };

  // Show psychology test if not completed
  if (!testCompleted && !showResults) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-6xl mx-auto pt-24 pb-12 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Discover Your Learning Style</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Take our psychology-based assessment to personalize your learning path and optimize your career development approach.
            </p>
          </div>
          <PsychologyTest onComplete={handleTestComplete} />
        </main>
      </div>
    );
  }

  // Show test results
  if (showResults && testResult) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-6xl mx-auto pt-24 pb-12 px-4">
          <TestResults 
            result={testResult} 
            onContinue={handleContinueToLearningPath} 
          />
        </main>
      </div>
    );
  }

  // Show original learning path content
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto pt-24 pb-12 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Personalized Learning Path</h1>
            <p className="text-muted-foreground">
              Based on your communication style assessment, here are your recommended courses and resources.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetTest}>
            Retake Assessment
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommended Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-muted-foreground">No courses yet. Add some from the ATS Optimization step in the Resume Builder.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {courses.map((c) => (
                  <li key={c} className="flex items-center justify-between gap-2">
                    <span>{c}</span>
                    <Button size="sm" variant="outline" onClick={() => navigate('/builder')}>Back to Builder</Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate('/builder')}>Back to Builder</Button>
              {courses.length > 0 && (
                <Button variant="destructive" onClick={clearCourses}>Clear All</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LearningPath;
