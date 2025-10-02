import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Copy, RefreshCw, Brain, MessageSquare, User, Code, Building } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeData } from '@/pages/Builder';
import { Badge } from "@/components/ui/badge";
import AnimatedBackground from '@/components/AnimatedBackground';
import ParticleField from '@/components/animations/ParticleField';
import PulseIndicator from '@/components/animations/PulseIndicator';
import WaveBackground from '@/components/animations/WaveBackground';

const InterviewPrep: React.FC = () => {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [questions, setQuestions] = useState<Record<string, string[]>>({
    behavioral: [],
    technical: [],
    projectBased: [],
    situational: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState("behavioral");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const savedData = localStorage.getItem('resume_builder_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setResumeData(parsedData);
        generateInitialQuestions(parsedData);
      } catch (error) {
        console.error('Error parsing saved resume data:', error);
        toast.error("Could not load your resume data");
      }
    } else {
      toast.error("No resume data found. Please build your resume first.");
    }
  }, []);
  
  const generateInitialQuestions = (data: ResumeData) => {
    setIsGenerating(true);
    
    const behavioralQuestions = generateBehavioralQuestions(data);
    const technicalQuestions = generateTechnicalQuestions(data);
    const projectQuestions = generateProjectQuestions(data);
    const situationalQuestions = generateSituationalQuestions(data);
    
    setQuestions({
      behavioral: behavioralQuestions,
      technical: technicalQuestions,
      projectBased: projectQuestions,
      situational: situationalQuestions
    });
    
    setIsGenerating(false);
    toast.success("Interview questions generated based on your resume");
  };
  
  const generateBehavioralQuestions = (data: ResumeData): string[] => {
    const questions = [
      `Tell me about a challenging situation you faced at ${data.experience?.[0]?.company || 'your previous role'} and how you overcame it.`,
      "Describe a time when you had to work under pressure to meet a tight deadline.",
      "Give an example of how you've demonstrated leadership in your role.",
      "Tell me about a time when you had to resolve a conflict within your team.",
      "Describe a situation where you had to adapt to significant changes."
    ];
    
    if (data.skills?.length) {
      questions.push(`How have you used your ${data.skills[0]} skills to solve a problem?`);
    }
    
    if (data.achievements?.length) {
      questions.push(`You mentioned ${data.achievements[0].title} as an achievement. Can you tell me more about your contribution?`);
    }
    
    return questions;
  };
  
  const generateTechnicalQuestions = (data: ResumeData): string[] => {
    const questions: string[] = [];
    
    if (data.skills?.length) {
      data.skills.slice(0, 3).forEach(skill => {
        questions.push(`Explain your proficiency level with ${skill} and provide an example of how you've used it.`);
      });
    }
    
    questions.push(
      "What development methodologies are you familiar with?",
      "How do you stay updated with the latest industry trends?",
      "Describe your debugging and troubleshooting process.",
      "How do you approach code reviews?"
    );
    
    return questions;
  };
  
  const generateProjectQuestions = (data: ResumeData): string[] => {
    const questions: string[] = [];
    
    if (data.projects?.length) {
      data.projects.slice(0, 3).forEach(project => {
        questions.push(`For your project "${project.title}", what was your specific role and contribution?`);
        questions.push(`What challenges did you face during "${project.title}" and how did you overcome them?`);
      });
    }
    
    if (data.portfolioItems?.length) {
      data.portfolioItems.slice(0, 2).forEach(item => {
        questions.push(`Tell me more about your portfolio item "${item.title}". What was the most challenging aspect?`);
      });
    }
    
    questions.push(
      "Which project are you most proud of and why?",
      "Describe a project that didn't go as planned. What did you learn from it?"
    );
    
    return questions;
  };
  
  const generateSituationalQuestions = (data: ResumeData): string[] => {
    const questions = [
      "How would you handle a situation where you disagree with your team's approach?",
      "What would you do if you received critical feedback from a manager?",
      "How would you prioritize tasks when working on multiple projects with competing deadlines?",
      "How would you handle a situation where you don't have all the information you need to complete a task?",
      "If a project was falling behind schedule, what steps would you take to get it back on track?"
    ];
    
    if (data.experience?.length) {
      const position = data.experience[0].position;
      questions.push(`As a ${position}, how would you handle a situation where a client or stakeholder is unsatisfied with your work?`);
    }
    
    return questions;
  };
  
  const regenerateQuestions = (category: string) => {
    setIsGenerating(true);
    
    let newQuestions: string[] = [];
    if (resumeData) {
      switch (category) {
        case 'behavioral':
          newQuestions = generateBehavioralQuestions(resumeData);
          break;
        case 'technical':
          newQuestions = generateTechnicalQuestions(resumeData);
          break;
        case 'projectBased':
          newQuestions = generateProjectQuestions(resumeData);
          break;
        case 'situational':
          newQuestions = generateSituationalQuestions(resumeData);
          break;
      }
    }
    
    setQuestions(prev => ({
      ...prev,
      [category]: newQuestions
    }));
    
    setIsGenerating(false);
    toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} questions regenerated`);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        toast.error("Failed to copy to clipboard");
      });
  };
  
  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const key = `${selectedTab}-${questionIndex}`;
    setAnswers(prev => ({
      ...prev,
      [key]: answer
    }));
  };
  
  const saveAnswer = (questionIndex: number) => {
    const key = `${selectedTab}-${questionIndex}`;
    if (answers[key]) {
      toast.success("Answer saved");
    }
  };
  
  const generateAnswerSuggestion = (question: string, questionIndex: number) => {
    const suggestions = [
      "Begin by providing a specific example that directly relates to the question.",
      "Use the STAR method: Situation, Task, Action, Result.",
      "Highlight your skills and achievements relevant to the question.",
      "Be concise and focus on your direct contributions.",
      "End with a reflection on what you learned or how you grew from the experience."
    ];
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    const key = `${selectedTab}-${questionIndex}`;
    setAnswers(prev => ({
      ...prev,
      [key]: `Suggested approach: ${suggestion}\n\nDraft your answer here...`
    }));
    
    toast.success("Answer suggestion generated");
  };
  
  const categories = [
    {
      id: "behavioral",
      label: "Behavioral",
      icon: User,
      description: "Leadership, teamwork, problem-solving",
      color: "text-blue-600"
    },
    {
      id: "technical",
      label: "Technical",
      icon: Code,
      description: "Skills, methodologies, expertise",
      color: "text-green-600"
    },
    {
      id: "projectBased",
      label: "Project-Based",
      icon: Building,
      description: "Specific project experiences",
      color: "text-purple-600"
    },
    {
      id: "situational",
      label: "Situational",
      icon: MessageSquare,
      description: "Hypothetical scenarios",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground variant="interactive" showParticles />
      <Header />
      
      <main className="pt-20 md:pt-28 pb-16 px-4 relative z-10">
        <WaveBackground intensity="subtle" className="top-0" />
        <div className="container mx-auto max-w-6xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Interview Preparation</h1>
                <p className="text-muted-foreground mt-2">
                  Practice with AI-generated questions tailored to your resume
                </p>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/builder')}
                className="flex items-center gap-2 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Builder
              </Button>
            </div>
          </motion.div>
          
          {!resumeData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <ParticleField particleCount={5} color="blue" className="opacity-25" />
                <Card className="modern-card p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent" />
                  <CardContent className="p-0 relative">
                    <motion.div 
                      className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Brain className="w-8 h-8 text-primary" />
                    </motion.div>
                    <CardTitle className="text-2xl mb-4">No Resume Data Found</CardTitle>
                    <p className="text-muted-foreground mb-6">
                      Please build your resume first to generate personalized interview questions.
                    </p>
                    <PulseIndicator intensity="medium" color="primary">
                      <Button onClick={() => navigate('/builder')} className="rounded-xl">
                        Go to Resume Builder
                      </Button>
                    </PulseIndicator>
                  </CardContent>
                </Card>
              </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <Card className="modern-card mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-400/5" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center"
                      animate={{ 
                        boxShadow: [
                          "0 0 0 0 rgba(124, 93, 250, 0.4)",
                          "0 0 0 15px rgba(124, 93, 250, 0)",
                          "0 0 0 0 rgba(124, 93, 250, 0.4)"
                        ]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Brain className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">
                        Interview Questions for {resumeData.fullName}
                      </CardTitle>
                      <CardDescription>
                        AI-generated questions based on your resume and experience
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6 bg-white dark:bg-card rounded-2xl p-2 shadow-sm">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <category.icon className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{category.label}</span>
                      <span className="sm:hidden">{category.label.split('-')[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map(category => (
                  <TabsContent key={category.id} value={category.id} className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${category.color.split('-')[1]}-100 dark:bg-${category.color.split('-')[1]}-900/20 rounded-xl flex items-center justify-center`}>
                          <category.icon className={`w-5 h-5 ${category.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{category.label} Questions</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <PulseIndicator intensity="subtle" color="blue">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => regenerateQuestions(category.id)}
                          disabled={isGenerating}
                          className="flex items-center gap-2 rounded-xl"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Regenerate
                        </Button>
                      </PulseIndicator>
                    </div>
                    
                    <div className="space-y-6">
                      {questions[category.id].map((question, index) => {
                        const answerKey = `${category.id}-${index}`;
                        return (
                          <motion.div
                            key={index} 
                            className="modern-card"
                            whileHover={{ 
                              scale: 1.01, 
                              y: -2,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <Card className="h-full relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-transparent to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <CardHeader className="pb-4 relative">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        Question {index + 1}
                                      </Badge>
                                    </div>
                                    <CardDescription className="text-base font-normal text-foreground">
                                      {question}
                                    </CardDescription>
                                  </div>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => copyToClipboard(question)}
                                      className="ml-4 rounded-xl"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                </div>
                              </CardHeader>
                              <CardContent className="relative">
                                <textarea
                                  className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
                                  placeholder="Type your answer here..."
                                  value={answers[answerKey] || ''}
                                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                                />
                              </CardContent>
                              <CardFooter className="flex justify-between pt-0 relative">
                                <motion.div whileHover={{ scale: 1.02 }}>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => generateAnswerSuggestion(question, index)}
                                    className="flex items-center gap-2 rounded-xl"
                                  >
                                    <Lightbulb className="h-4 w-4" />
                                    Get Suggestion
                                  </Button>
                                </motion.div>
                                <PulseIndicator 
                                  intensity="subtle" 
                                  color="primary"
                                  disabled={!answers[answerKey]}
                                >
                                  <Button 
                                    size="sm"
                                    onClick={() => saveAnswer(index)}
                                    className="rounded-xl"
                                    disabled={!answers[answerKey]}
                                  >
                                    Save Answer
                                  </Button>
                                </PulseIndicator>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewPrep;
