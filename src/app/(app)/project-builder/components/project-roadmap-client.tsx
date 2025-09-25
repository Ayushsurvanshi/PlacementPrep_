'use client';

import type { GenerateProjectRoadmapOutput } from '@/ai/flows/ai-generate-project-roadmap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Code, BotMessageSquare, Loader2, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { generateCodeSnippetAction } from '../actions';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectRoadmapClientProps {
  roadmap: GenerateProjectRoadmapOutput | null;
  isLoading: boolean;
}

type Task = GenerateProjectRoadmapOutput['tasks'][0];

const LoadingSkeleton = () => (
    <div className="mt-8 space-y-8">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-20 w-full" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Skeleton className="h-6 w-1/4 mb-3" />
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-6 w-1/4 mb-3" />
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

export function ProjectRoadmapClient({ roadmap, isLoading }: ProjectRoadmapClientProps) {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editorTheme, setEditorTheme] = useState<any>(githubLight);
  const { toast } = useToast();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setEditorTheme(isDark ? githubDark : githubLight);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  if (!roadmap) {
    return (
        <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-dashed shadow-sm bg-card mt-8">
            <div className="text-center">
                <BotMessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Your Project Roadmap Will Appear Here</h3>
                <p className="mt-2 text-sm text-muted-foreground">Select at least two technologies and click "Generate" to start.</p>
            </div>
        </div>
    );
  }

  const handleTaskToggle = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleGetCodeClick = async (task: Task) => {
    setSelectedTask(task);
    setIsCodeDialogOpen(true);
    setIsGeneratingCode(true);
    setGeneratedCode('');

    try {
        const preferredLanguage = roadmap.recommendedTechStack.find(tech => ['JavaScript', 'Python', 'Java', 'Go', 'TypeScript'].includes(tech)) || 'JavaScript';
        const result = await generateCodeSnippetAction({
            taskTitle: task.title,
            taskDescription: task.description,
            techStack: roadmap.recommendedTechStack,
            language: preferredLanguage
        });
        setGeneratedCode(result.codeSnippet);
    } catch (e) {
        console.error(e);
        setGeneratedCode("// Sorry, we couldn't generate code for this task. Please try again.");
    } finally {
        setIsGeneratingCode(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({ title: 'Code Copied!', description: 'The code snippet has been copied to your clipboard.' });
  }

  const tasksByCategory = roadmap.tasks.reduce((acc, task) => {
    const category = task.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const categoryOrder: Task['category'][] = ["Setup", "Backend", "Frontend", "Testing", "Deployment", "Documentation"];

  return (
    <>
      <AnimatePresence>
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-8"
          >
              <Card>
                  <CardHeader>
                      <CardTitle className="text-3xl font-bold">{roadmap.projectName}</CardTitle>
                      <CardDescription className="text-lg text-muted-foreground pt-1">{roadmap.projectDescription}</CardDescription>
                  </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">Recommended Tech Stack</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                      {roadmap.recommendedTechStack.map(tech => (
                          <Badge key={tech} variant="secondary" className="text-base px-3 py-1">{tech}</Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">Development Tasks</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                    {categoryOrder.map(category => (
                        tasksByCategory[category] && (
                            <div key={category}>
                                <h4 className="text-lg font-semibold text-accent mb-3 pb-2 border-b-2 border-accent/20">{category}</h4>
                                <div className="space-y-3">
                                    {tasksByCategory[category].map((task, index) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="flex items-start gap-4 p-4 rounded-lg bg-card border transition-shadow hover:shadow-md"
                                        >
                                            <Checkbox
                                                id={`task-${task.id}`}
                                                checked={!!completedTasks[task.id]}
                                                onCheckedChange={() => handleTaskToggle(task.id)}
                                                className="mt-1 h-5 w-5"
                                            />
                                            <div className="flex-1">
                                                <label
                                                    htmlFor={`task-${task.id}`}
                                                    className={`font-medium cursor-pointer ${completedTasks[task.id] ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}
                                                >
                                                    {task.title}
                                                </label>
                                                <p className={`text-sm ${completedTasks[task.id] ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>
                                                    {task.description}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => handleGetCodeClick(task)} className="shrink-0">
                                                <Code className="mr-2 h-4 w-4" /> Get Code
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </CardContent>
              </Card>
          </motion.div>
      </AnimatePresence>
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
              <DialogHeader>
                  <DialogTitle>AI Code Assistant</DialogTitle>
                  <DialogDescription>
                      Generated code for: <span className="font-semibold text-primary">{selectedTask?.title}</span>
                  </DialogDescription>
              </DialogHeader>
              <div className="relative flex-1 border rounded-md overflow-y-auto">
                  {isGeneratingCode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                  )}
                  <CodeMirror
                      value={generatedCode}
                      height="100%"
                      theme={editorTheme}
                      extensions={[javascript({ jsx: true, typescript: true })]}
                      readOnly
                  />
                  {!isGeneratingCode && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 z-20 h-8 w-8"
                        onClick={copyToClipboard}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                  )}
              </div>
          </DialogContent>
      </Dialog>
    </>
  );
}
