
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getMockInterviewFeedbackAction, generateJobDescriptionAction, generateInterviewQuestionsAction } from "@/app/(app)/prep-hub/actions";
import type { MockInterviewFeedbackOutput } from "@/ai/flows/ai-mock-interview-feedback";
import { Loader2, ArrowRight, CheckCircle, RefreshCw, Mic, MicOff, Video, Volume2, Square, VolumeX, UploadCloud, Sparkles, Award, FileUp, ThumbsUp, Lightbulb, Cpu, MessageSquare, Play, Send, Settings, Code, Terminal, XCircle, ChevronsUpDown, Check } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import interviewQuestionsData from '@/data/interviewQuestions.json';
import problemsData from '@/data/codingProblems.json';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useIsMobile } from '@/hooks/use-mobile';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const languageMap = {
    javascript: [javascript({ jsx: true, typescript: true })],
    python: [python()],
    java: [java()],
    cpp: [cpp()],
};
type Language = keyof typeof languageMap;

const formSchema = z.object({
  jobDescription: z.string().min(50, "Please provide a detailed job description."),
  resume: z.string().min(1, "Please upload your resume file."),
  targetCompany: z.string({ required_error: "Please select a target company." }).min(1, "Please select a target company."),
  interviewType: z.enum(['technical', 'hr'], { required_error: "Please select an interview type."}),
});

type Problem = (typeof problemsData)[0];
type InterviewQuestion = {
    id: string;
    type: 'behavioral' | 'technical' | 'coding';
    text: string;
    problem?: Problem;
};

type InterviewHistoryItem = {
    date: string;
    score: number;
};

let SpeechRecognition: any;

export function MockInterviewClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [feedback, setFeedback] = useState<MockInterviewFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [interviewState, setInterviewState] = useState<'not_started' | 'in_progress' | 'finished'>('not_started');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [aiStatus, setAiStatus] = useState<'IDLE' | 'SPEAKING' | 'LISTENING' | 'ANALYZING'>('IDLE');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const nextQuestionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spokenQuestionIndexRef = useRef<number | null>(null);

  // Combobox state
  const [companyComboboxOpen, setCompanyComboboxOpen] = useState(false)

  // Coding question states
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState<Language>('javascript');
  const [editorTheme, setEditorTheme] = useState<any>(githubLight);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
      resume: "",
      targetCompany: "",
      interviewType: "technical",
    },
  });

  const clearAllTimers = useCallback(() => {
    if (nextQuestionTimerRef.current) clearTimeout(nextQuestionTimerRef.current);
  }, []);

  const stopRecording = useCallback(() => {
    if(recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const finishInterview = useCallback(async (finalAnswers: string[]) => {
    clearAllTimers();
    setIsLoading(true);
    setAiStatus('ANALYZING');
    setInterviewState('finished');
    if (isRecording) stopRecording();

    const transcript = questions.map((question, index) => {
        if (question.type === 'coding') {
            return `Question: [CODING] ${question.text}\nAnswer:\n\`\`\`${language}\n${finalAnswers[index] || ''}\n\`\`\``;
        }
        return `Question: ${question.text}\nAnswer: ${finalAnswers[index] || ''}`;
    }).join('\n\n');

    try {
      const result = await getMockInterviewFeedbackAction({
        jobDescription: form.getValues('jobDescription'),
        resume: form.getValues('resume'),
        interviewTranscript: transcript,
      });
      setFeedback(result);
       if (result.overallScore) {
          const newHistoryEntry: InterviewHistoryItem = {
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              score: result.overallScore,
          };
          const storedHistory = localStorage.getItem('interviewHistory');
          const history = storedHistory ? JSON.parse(storedHistory) : [];
          const updatedHistory = [...history, newHistoryEntry];
          localStorage.setItem('interviewHistory', JSON.stringify(updatedHistory));
      }
    } catch (e) {
      setError("An error occurred while getting feedback. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
      setAiStatus('IDLE');
    }
  }, [clearAllTimers, form, isRecording, questions, stopRecording, language]);

  const handleNextQuestion = useCallback(() => {
    clearAllTimers();
    if (isRecording) stopRecording();
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishInterview(newAnswers);
    }
  }, [clearAllTimers, isRecording, stopRecording, answers, currentQuestionIndex, currentAnswer, questions.length, finishInterview]);

  useEffect(() => {
    setIsMounted(true);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

    SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
    }

    const updateTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        setEditorTheme(isDark ? githubDark : githubLight);
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const startRecording = useCallback(() => {
    if (!isSpeechRecognitionSupported) {
      if(interviewState === 'in_progress') {
          toast({ variant: 'destructive', title: 'Voice Input Not Supported', description: 'Your browser doesn\'t support voice recognition. Please type your answer manually.' });
      }
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        setIsRecording(true);
        setAiStatus('LISTENING');
    }
    
    recognition.onend = () => {
        setIsRecording(false);
        setAiStatus('IDLE');
        recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      console.error(`Speech recognition error: ${event.error}`, event);
      setAiStatus('IDLE');
      let description = 'An unknown error occurred with voice input.';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        description = 'Microphone access was denied. Please enable it in your browser settings.';
      } else if (event.error === 'no-speech') {
        description = 'No speech was detected. Please try again.';
        return; 
      } else if (event.error === 'network'){
        description = "Network error with voice recognition. Please check your connection.";
      }
      toast({ variant: 'destructive', title: 'Voice Input Error', description });
      recognitionRef.current = null;
    };
    
    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      clearAllTimers();
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setCurrentAnswer(finalTranscript + interimTranscript);
    };

    setCurrentAnswer('');
    recognition.start();
  }, [isSpeechRecognitionSupported, toast, interviewState, clearAllTimers]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window) || isMuted) {
      onEnd?.();
      return;
    }
  
    window.speechSynthesis.cancel();
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
        setIsAiSpeaking(true);
        setAiStatus('SPEAKING');
    };
    utterance.onend = () => {
      setIsAiSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis Error:', event);
      setIsAiSpeaking(false);
      setAiStatus('IDLE');
      toast({ variant: 'destructive', title: 'Browser Voice Error', description: 'Could not play question audio.' });
      onEnd?.();
    };
    window.speechSynthesis.speak(utterance);
  }, [isMuted, toast]);
  
  useEffect(() => {
    if (interviewState !== 'in_progress') {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        window.speechSynthesis.cancel();
        return;
    }
  
    let stream: MediaStream;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };
  
    getCameraPermission();
  
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      stopRecording();
      window.speechSynthesis.cancel();
      clearAllTimers();
    };
  }, [interviewState, toast, stopRecording, clearAllTimers]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (interviewState !== 'in_progress' || !questions.length) {
      return;
    }
    
    if (currentQuestion.type === 'coding' && currentQuestion.problem) {
        setCurrentAnswer(currentQuestion.problem.defaultCode[language] || '');
        return;
    }

    let initialDelayTimer: NodeJS.Timeout | null = null;
    
    const onSpeakEnd = () => {
      setAiStatus('IDLE');
      if (!isRecording) {
        startRecording();
      }
      clearAllTimers();
      nextQuestionTimerRef.current = setTimeout(() => {
        toast({ title: 'Moving to Next Question', description: 'No response detected.' });
        handleNextQuestion();
      }, 30000); // 30 seconds
    };

    if (spokenQuestionIndexRef.current !== currentQuestionIndex) {
      window.speechSynthesis.cancel();
      spokenQuestionIndexRef.current = currentQuestionIndex;
      
      const speakQuestion = () => speak(currentQuestion.text, onSpeakEnd);
      
      if (currentQuestionIndex === 0) {
        initialDelayTimer = setTimeout(speakQuestion, 5000);
      } else {
        speakQuestion();
      }
    }

    return () => {
      if (initialDelayTimer) clearTimeout(initialDelayTimer);
    };
  }, [interviewState, currentQuestionIndex, questions, isRecording, speak, startRecording, handleNextQuestion, toast, clearAllTimers, language, currentQuestion]);

  const handleToggleRecording = useCallback(() => {
    if(isRecording){
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  async function startInterview(values: z.infer<typeof formSchema>) {
    setIsGeneratingQuestions(true);
    setAiStatus('ANALYZING');
    setError(null);

    try {
      const { questions: generatedQuestions } = await generateInterviewQuestionsAction({
        resume: values.resume,
        targetCompany: values.targetCompany,
        interviewType: values.interviewType,
      });

      if (!generatedQuestions || generatedQuestions.length === 0) {
        toast({ variant: 'destructive', title: 'Interview Setup Error', description: "AI failed to generate questions. Please check your resume format and try again." });
        setIsGeneratingQuestions(false);
        setAiStatus('IDLE');
        return;
      }
      
      let finalQuestions: InterviewQuestion[] = generatedQuestions.map(q => ({...q, type: q.type as 'behavioral' | 'technical'}));

      if (values.interviewType === 'technical') {
          const easyCodingProblems = problemsData.filter(p => p.difficulty === 'Easy');

          if (easyCodingProblems.length >= 2) {
              const codingProblems = [...easyCodingProblems];
              
              const problem1Index = Math.floor(Math.random() * codingProblems.length);
              const problem1 = codingProblems.splice(problem1Index, 1)[0];
              const problem2Index = Math.floor(Math.random() * codingProblems.length);
              const problem2 = codingProblems.splice(problem2Index, 1)[0];

              const codingQuestion1: InterviewQuestion = {
                  id: `coding-${problem1.id}`,
                  type: 'coding',
                  text: problem1.title,
                  problem: problem1 as Problem
              };
              const codingQuestion2: InterviewQuestion = {
                  id: `coding-${problem2.id}`,
                  type: 'coding',
                  text: problem2.title,
                  problem: problem2 as Problem
              };

              finalQuestions.splice(5, 0, codingQuestion1);
              finalQuestions.splice(11, 0, codingQuestion2);
          } else {
            toast({
                variant: 'destructive',
                title: 'Setup Error',
                description: "Not enough 'Easy' coding problems available to generate a technical interview.",
            });
            setIsGeneratingQuestions(false);
            setAiStatus('IDLE');
            return;
          }
      }
      
      setQuestions(finalQuestions);
      setInterviewState('in_progress');
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setCurrentAnswer('');
      setFeedback(null);
    } catch (e) {
      setError("An error occurred while generating questions. Please try again.");
      console.error(e);
    } finally {
      setIsGeneratingQuestions(false);
      setAiStatus('IDLE');
    }
  }

  const handleEndInterview = () => {
    clearAllTimers();
    const finalAnswers = [...answers];
    if (isRecording) {
      stopRecording();
    }
    finalAnswers[currentQuestionIndex] = currentAnswer;
    finishInterview(finalAnswers);
  };

  const resetInterview = () => {
    clearAllTimers();
    setInterviewState('not_started');
    setFeedback(null);
    setError(null);
    form.reset({ jobDescription: "", resume: "", targetCompany: "", interviewType: "technical" });
    setAnswers([]);
    setCurrentAnswer('');
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setIsMuted(false);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue('resume', '');
    try {
      let fileContent = '';
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item: any) => 'str' in item ? item.str : '').join(' ');
        }
        fileContent = text;
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        fileContent = result.value;
      } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        fileContent = await file.text();
      } else {
        toast({ variant: 'destructive', title: 'Unsupported File Type', description: 'Please upload a .pdf, .docx, .txt, or .md file.' });
        return;
      }
      
      if (fileContent.trim().length === 0) {
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not extract text. The file might be empty or corrupted.' });
        return;
      }

      form.setValue('resume', fileContent, { shouldValidate: true });
      setIsGeneratingDescription(true);
      try {
        const result = await generateJobDescriptionAction({ resume: fileContent });
        form.setValue('jobDescription', result.jobDescription, { shouldValidate: true });
      } catch (aiErr) {
        console.error("Job description generation error:", aiErr);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not auto-generate a job description. Please paste it manually.' });
      } finally {
        setIsGeneratingDescription(false);
      }
    } catch (err) {
      console.error("File parsing error:", err);
      let errorMessage = "An error occurred while parsing the file. Please ensure it's not corrupted and try again.";
      if (err instanceof Error && (err.name === 'NetworkError' || err.message.includes('NetworkError'))) {
        errorMessage = "A network error occurred. This can happen if a script is blocked by your network or an ad-blocker. Please check your connection and try again.";
      }
      toast({ variant: 'destructive', title: 'Resume Upload Failed', description: errorMessage, duration: 9000 });
    } finally {
        if(e.target) e.target.value = '';
    }
  };

  const AIStatusIndicator = ({ status }: { status: typeof aiStatus }) => {
    const statusConfig = {
        IDLE: { text: "Awaiting Response", icon: <Mic className="h-4 w-4" />, color: "text-muted-foreground" },
        SPEAKING: { text: "AI is Speaking", icon: <Volume2 className="h-4 w-4 animate-pulse" />, color: "text-accent" },
        LISTENING: { text: "Listening...", icon: <Mic className="h-4 w-4 text-red-500 animate-pulse" />, color: "text-red-500" },
        ANALYZING: { text: "Analyzing...", icon: <Loader2 className="h-4 w-4 animate-spin" />, color: "text-primary" },
    };
    const current = statusConfig[status];
    return (
        <Badge variant="outline" className={`flex items-center gap-2 text-sm font-medium py-1.5 px-3 border-dashed ${current.color}`}>
            {current.icon}
            <span>{current.text}</span>
        </Badge>
    );
  };
  
  const renderContent = () => {
    if (interviewState === 'in_progress') {
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        
        if (currentQuestion.type === 'coding' && currentQuestion.problem) {
            return (
                <div className="h-[calc(100vh-12rem)] flex flex-col">
                    <header className="flex items-center justify-between p-2 border-b shrink-0 flex-wrap gap-2">
                        <div className='flex items-center gap-4'>
                            <div>
                                <h1 className="text-xl font-semibold">Coding Challenge: {currentQuestion.text}</h1>
                                <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={handleNextQuestion}>
                                <Send className="mr-2 h-4 w-4" />
                                Submit & Next
                            </Button>
                        </div>
                    </header>

                    <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="flex-grow">
                        <ResizablePanel defaultSize={isMobile ? 40 : 40} minSize={25}>
                            <Card className="h-full rounded-none border-0 border-r overflow-y-auto">
                                <CardHeader>
                                    <CardTitle>Problem Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                                        <p>{currentQuestion.problem.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={isMobile ? 60 : 60} minSize={30}>
                            <div className="flex flex-col h-full">
                                <div className="flex items-center p-2 border-b">
                                    <Code className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                                        <SelectTrigger className="w-[180px] h-8">
                                            <SelectValue placeholder="Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="javascript">JavaScript</SelectItem>
                                            <SelectItem value="python">Python</SelectItem>
                                            <SelectItem value="java">Java</SelectItem>
                                            <SelectItem value="cpp">C++</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="h-full w-full overflow-auto">
                                   <CodeMirror 
                                        value={currentAnswer}
                                        height="100%"
                                        theme={editorTheme}
                                        extensions={languageMap[language]}
                                        onChange={setCurrentAnswer}
                                        basicSetup={{
                                            foldGutter: true,
                                            dropCursor: true,
                                            allowMultipleSelections: true,
                                            indentOnInput: true,
                                        }}
                                   />
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            );
        }

        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 w-full lg:flex lg:items-center">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Video className="h-6 w-6" /> Your Camera</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden border">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                        </div>
                        {hasCameraPermission === false && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>Please allow camera and microphone access to use this feature.</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
              <Card className="h-full">
                  <CardHeader className="flex flex-row justify-between items-start">
                      <div>
                          <CardTitle>Interview Dashboard</CardTitle>
                          <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                      </div>
                      <AIStatusIndicator status={aiStatus}/>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <Progress value={progress} className="w-full" />
                      <div className="p-6 bg-muted/50 rounded-lg space-y-2 border min-h-[150px] flex flex-col justify-center">
                          <div className="flex justify-between items-center">
                              <Badge variant={currentQuestion.type === 'behavioral' ? 'secondary' : 'default'} className="capitalize">{currentQuestion.type}</Badge>
                              <TooltipProvider>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsMuted(prev => !prev)} disabled={!('speechSynthesis' in window)}>
                                              {isMuted || !('speechSynthesis' in window) ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                          </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                          <p>{!('speechSynthesis' in window) ? "Browser voice not supported" : (isMuted ? "Unmute AI Voice" : "Mute AI Voice")}</p>
                                      </TooltipContent>
                                  </Tooltip>
                              </TooltipProvider>
                          </div>
                          <p className="font-semibold text-lg">{currentQuestion.text}</p>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between items-center">
                              <Label htmlFor="answer">Your Answer</Label>
                              <TooltipProvider>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <span tabIndex={0}>
                                              <Button onClick={handleToggleRecording} size="sm" variant={isRecording ? "destructive" : "outline"} disabled={isAiSpeaking || !isSpeechRecognitionSupported}>
                                                  {isRecording ? <><MicOff className="mr-2 h-4 w-4" />Stop</> : <><Mic className="mr-2 h-4 w-4" />Record</>}
                                              </Button>
                                          </span>
                                      </TooltipTrigger>
                                      {!isSpeechRecognitionSupported && (
                                          <TooltipContent><p>Voice input is not supported in your browser.</p></TooltipContent>
                                      )}
                                  </Tooltip>
                              </TooltipProvider>
                          </div>
                          <Textarea id="answer" placeholder={isRecording ? "Listening..." : "Click record to start or type your answer here..."} rows={8} value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} disabled={isRecording}/>
                          {!isSpeechRecognitionSupported && interviewState === 'in_progress' && (
                              <Alert variant="destructive" className="mt-4">
                                  <MicOff className="h-4 w-4" />
                                  <AlertTitle>Voice Input Not Supported</AlertTitle>
                                  <AlertDescription>
                                      Your browser doesn't support voice recognition. Please use Google Chrome for the best experience, or type your answer manually.
                                  </AlertDescription>
                              </Alert>
                          )}
                      </div>
                  </CardContent>
                  <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between items-center border-t pt-6">
                      <Button variant="destructive" onClick={handleEndInterview} disabled={isAiSpeaking} className="w-full sm:w-auto">
                          <Square className="mr-2 h-4 w-4" />
                          End Interview
                      </Button>
                      <Button onClick={handleNextQuestion} disabled={isRecording || isAiSpeaking} className="w-full sm:w-auto">
                          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish & Get Feedback'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                  </CardFooter>
              </Card>
            </div>
          </div>
        );
      }
      
    if (interviewState === 'finished') {
        return (
          <Card>
              <CardHeader>
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div>
                              <CardTitle>Interview Complete!</CardTitle>
                              <CardDescription>Here is your personalized feedback.</CardDescription>
                          </div>
                      </div>
                      <Button variant="outline" onClick={resetInterview}><RefreshCw className="mr-2 h-4 w-4" />Start New Interview</Button>
                  </div>
              </CardHeader>
              <CardContent>
                  {isLoading && (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm bg-card p-8 min-h-[300px]">
                          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                          <p className="mt-4 text-muted-foreground">Our AI coach is analyzing your interview...</p>
                      </div>
                  )}
                  {error && (
                      <Alert variant="destructive" className="w-full">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                      </Alert>
                  )}
                  {feedback && (
                    <div className="w-full space-y-6 mt-4">
                        <Card className="bg-accent/10 border-accent">
                            <CardHeader className="flex-row items-center gap-4">
                                <Award className="h-10 w-10 text-accent" />
                                <div>
                                    <CardTitle className="text-xl">Your Interview Score</CardTitle>
                                    <CardDescription>A measure of your overall performance.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-5xl font-bold text-accent">{feedback.overallScore}<span className="text-3xl text-muted-foreground">/100</span></p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-xl">Overall Feedback</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">{feedback.overallFeedback}</p></CardContent>
                        </Card>
                        
                        <Accordion type="multiple" defaultValue={['strengths']} className="w-full space-y-4">
                            <Card><AccordionItem value="strengths" className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold p-6 hover:no-underline">
                                    <div className="flex items-center gap-3"><ThumbsUp className="h-6 w-6 text-green-500" /> Strengths</div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <p className="text-muted-foreground">{feedback.strengths}</p>
                                </AccordionContent>
                            </AccordionItem></Card>

                            <Card><AccordionItem value="improvement" className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold p-6 hover:no-underline">
                                    <div className="flex items-center gap-3"><Lightbulb className="h-6 w-6 text-yellow-500" /> Areas for Improvement</div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <p className="text-muted-foreground">{feedback.areasForImprovement}</p>
                                </AccordionContent>
                            </AccordionItem></Card>

                            <Card><AccordionItem value="technical" className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold p-6 hover:no-underline">
                                    <div className="flex items-center gap-3"><Cpu className="h-6 w-6 text-blue-500" /> Technical Feedback</div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <p className="text-muted-foreground">{feedback.technicalFeedback}</p>
                                </AccordionContent>
                            </AccordionItem></Card>

                            <Card><AccordionItem value="communication" className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold p-6 hover:no-underline">
                                    <div className="flex items-center gap-3"><MessageSquare className="h-6 w-6 text-purple-500" /> Communication Feedback</div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <p className="text-muted-foreground">{feedback.communicationFeedback}</p>
                                </AccordionContent>
                            </AccordionItem></Card>
                        </Accordion>
                    </div>
                  )}
              </CardContent>
          </Card>
        );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <div className="lg:col-span-2 space-y-6 lg:pt-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-10 w-10 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Your AI Interview Coach</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Step into a realistic interview simulation tailored just for you. Get instant, actionable feedback to sharpen your skills and boost your confidence.
          </p>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-1 shrink-0" />
              <span><strong>Personalized Questions:</strong> The AI generates questions based on your resume and target company, including live coding challenges.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-1 shrink-0" />
              <span><strong>Live Practice:</strong> Answer questions via voice or text with a live camera feed and a built-in code editor.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-1 shrink-0" />
              <span><strong>Instant Feedback:</strong> Receive a detailed analysis of your performance after the interview.</span>
            </li>
          </ul>
          <div className="relative mt-8">
              <Image
                  src="https://placehold.co/600x400.png"
                  alt="AI Interview Coach Illustration"
                  data-ai-hint="interview robot"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg w-full h-auto"
              />
          </div>
        </div>
        <div className="lg:col-span-3">
          <Card>
              <CardHeader>
                <CardTitle>Interview Setup</CardTitle>
                <CardDescription>Complete these 4 steps to start your personalized mock interview.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(startInterview)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="resume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1. Upload Your Resume</FormLabel>
                          <FormControl>
                            <Label htmlFor="resume-upload-input" className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <FileUp className="w-8 h-8 mb-3 text-muted-foreground" />
                                    <p className="mb-1 text-sm text-muted-foreground">
                                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, or MD</p>
                                </div>
                                <Input id="resume-upload-input" type="file" className="sr-only" accept=".pdf,.docx,.txt,.md" onChange={handleFileChange} />
                            </Label>
                          </FormControl>
                          <FormDescription>
                            {form.getValues('resume').length > 0 && (
                              <span className="flex items-center gap-1.5 mt-1 font-medium text-accent">
                                <CheckCircle className="h-4 w-4" /> Resume parsed successfully.
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="interviewType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>2. Select Interview Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                              disabled={form.getValues('resume').length === 0}
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="technical" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Technical Interview
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="hr" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  HR Interview
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetCompany"
                      render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>3. Select Target Company</FormLabel>
                            <Popover open={companyComboboxOpen} onOpenChange={setCompanyComboboxOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                     disabled={form.getValues('resume').length === 0}
                                  >
                                    {field.value
                                      ? interviewQuestionsData.companies.find(
                                          (company) => company.name === field.value
                                        )?.name
                                      : "Select a company"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                  <CommandInput placeholder="Search company..." />
                                  <CommandEmpty>No company found.</CommandEmpty>
                                  <CommandList>
                                      <CommandGroup>
                                        {interviewQuestionsData.companies.map((company) => (
                                          <CommandItem
                                            value={company.name}
                                            key={company.name}
                                            onSelect={() => {
                                              form.setValue("targetCompany", company.name, { shouldValidate: true })
                                              setCompanyComboboxOpen(false)
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === company.name ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {company.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Tailor questions for a specific company.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            4. Review Job Description
                          </FormLabel>
                          <FormControl>
                            <Textarea placeholder={isGeneratingDescription ? "AI is generating a job description from your resume..." : "Job description will be generated here. You can also paste one manually."} {...field} rows={8} disabled={isGeneratingDescription || form.getValues('resume').length === 0} />
                          </FormControl>
                          <FormDescription>The AI generates this, but you can edit it for more specific practice.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="lg" className="w-full" disabled={!form.formState.isValid || isLoading || isGeneratingDescription || isGeneratingQuestions}>
                      {(isLoading || isGeneratingDescription || isGeneratingQuestions) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isGeneratingQuestions ? "Generating Questions..." : "Start Your Mock Interview"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Mock Interview</CardTitle>
                <CardDescription>Simulate a real interview and get instant, AI-powered feedback.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed shadow-sm bg-card">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div>
      {renderContent()}
    </div>
  );
}

    