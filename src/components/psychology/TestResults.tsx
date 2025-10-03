import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, BookOpen, Users, CheckCircle } from 'lucide-react';

interface TestResultsProps {
  result: {
    dominantStyle: 'Realistic' | 'Elaborate' | 'Short';
    scores: { Realistic: number; Elaborate: number; Short: number };
    percentage: number;
  };
  onContinue: () => void;
}

const styleConfigs = {
  Realistic: {
    icon: Target,
    color: 'text-sage-foreground',
    bgColor: 'bg-sage/10',
    borderColor: 'border-sage/30',
    title: 'Realistic Communicator',
    description: 'You prefer fact-based, data-driven communication with concrete examples and measurable outcomes.',
    learningApproach: [
      'Focus on case studies and real-world applications',
      'Emphasize quantifiable achievements and metrics',
      'Practice with actual interview scenarios and questions',
      'Use specific examples and proven methodologies'
    ],
    resumeStyle: 'Your resume should highlight specific accomplishments with numbers, percentages, and concrete results.',
    interviewStyle: 'In interviews, focus on providing evidence-based answers with clear timelines and measurable impacts.'
  },
  Elaborate: {
    icon: BookOpen,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    title: 'Elaborate Communicator',
    description: 'You excel at comprehensive storytelling, providing context, and explaining the bigger picture.',
    learningApproach: [
      'Comprehensive guides with background and reasoning',
      'Understanding company culture and full context',
      'Building narratives that connect experiences',
      'Exploring multiple perspectives and approaches'
    ],
    resumeStyle: 'Your resume should tell your professional story with context, showing career progression and growth.',
    interviewStyle: 'In interviews, leverage your storytelling ability to paint complete pictures of your experiences.'
  },
  Short: {
    icon: Users,
    color: 'text-coral-foreground',
    bgColor: 'bg-coral/10',
    borderColor: 'border-coral/30',
    title: 'Concise Communicator',
    description: 'You value efficiency and clarity, delivering key points with precision and impact.',
    learningApproach: [
      'Practical guides with actionable takeaways',
      'Key talking points and essential preparation',
      'Quick reference materials and checklists',
      'Focused, results-oriented content'
    ],
    resumeStyle: 'Your resume should be clean and impactful, highlighting key achievements with strong action verbs.',
    interviewStyle: 'In interviews, deliver clear, confident answers that quickly establish your value proposition.'
  }
};

const TestResults: React.FC<TestResultsProps> = ({ result, onContinue }) => {
  const config = styleConfigs[result.dominantStyle];
  const IconComponent = config.icon;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Main Result Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`${config.borderColor} border-2 ${config.bgColor}`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${config.bgColor} border ${config.borderColor}`}>
                <IconComponent className={`h-8 w-8 ${config.color}`} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Congratulations! You are a {config.title}
            </CardTitle>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              {config.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {result.percentage}% Match
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Score Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Your Communication Style Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(result.scores).map(([style, score]) => {
              const percentage = Math.round((score / 10) * 100);
              const isTop = style === result.dominantStyle;
              return (
                <div key={style} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isTop ? 'text-primary' : 'text-muted-foreground'}`}>
                      {style}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {score}/10 responses ({percentage}%)
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${isTop ? 'bg-primary/20' : ''}`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Personalized Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Learning Approach */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Learning Path Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {config.learningApproach.map((approach, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{approach}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resume & Interview Style */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tailored Advice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Resume Strategy:</h4>
              <p className="text-sm text-muted-foreground">{config.resumeStyle}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Interview Approach:</h4>
              <p className="text-sm text-muted-foreground">{config.interviewStyle}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center"
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          Continue to Your Personalized Learning Path
        </Button>
      </motion.div>
    </div>
  );
};

export default TestResults;