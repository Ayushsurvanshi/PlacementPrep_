
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import problems from '@/data/codingProblems.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Send, RefreshCw, Settings, Code, Terminal, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useIsMobile } from '@/hooks/use-mobile';

const languageMap = {
    javascript: [javascript({ jsx: true, typescript: true })],
    python: [python()],
    java: [java()],
    cpp: [cpp()],
};
type Language = keyof typeof languageMap;

type Problem = {
    id: number;
    title: string;
    difficulty: string;
    tags: string[];
    status: string;
    companies: string[];
    description: string;
    defaultCode: Record<Language, string>;
};

export default function SolvePage() {
    const params = useParams<{ problemId: string }>();
    const problem = problems.find(p => p.id.toString() === params.problemId) as Problem | undefined;
    
    const [mounted, setMounted] = useState(false);
    const isMobile = useIsMobile();
    const [language, setLanguage] = useState<Language>('javascript');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('Click "Run" to see the output here.');
    const [editorTheme, setEditorTheme] = useState<any>(githubLight);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (problem) {
            setCode(problem.defaultCode[language]);
        }
    }, [problem, language]);

    useEffect(() => {
        const updateTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setEditorTheme(isDark ? githubDark : githubLight);
        };
        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const onCodeChange = useCallback((value: string) => {
        setCode(value);
    }, []);

    const handleRun = () => {
        setSubmissionStatus('running');
        setOutput('Running your code against sample test cases...');

        if (!problem) return;

        if (code.trim() === problem.defaultCode[language].trim() || code.trim() === '') {
            setTimeout(() => {
                setSubmissionStatus('error');
                setOutput('Execution Error: No solution provided.\nPlease write your code before running.');
            }, 500);
            return;
        }

        setTimeout(() => {
            setSubmissionStatus('idle');
            setOutput('Test Case 1: Passed\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n\nTest Case 2: Passed\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nSuccessfully executed sample test cases.');
        }, 1500);
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setSubmissionStatus('running');
        setOutput('Submitting your solution for judging...');

        if (!problem) return;

        if (code.trim() === problem.defaultCode[language].trim() || code.trim() === '') {
            setTimeout(() => {
                setSubmissionStatus('error');
                setOutput('Submission Error: No solution provided.\nPlease write your code before submitting.');
                setIsSubmitting(false);
            }, 500);
            return;
        }

        setTimeout(() => {
            const isSuccess = Math.random() > 0.5; // Random success/fail for simulation
            if (isSuccess) {
                setSubmissionStatus('success');
                setOutput('Status: Accepted\n\nCongratulations! Your solution was accepted.\n\nRuntime: 88 ms\nMemory: 42.5 MB');
            } else {
                setSubmissionStatus('error');
                setOutput('Status: Wrong Answer\n\nSubmission failed on test case 3.\nInput: nums = [3,3], target = 6\nOutput: [0,0]\nExpected: [0,1]');
            }
            setIsSubmitting(false);
        }, 2500);
    };

    const handleReset = () => {
        if (problem) {
            setCode(problem.defaultCode[language]);
            setOutput('Click "Run" to see the output here.');
            setSubmissionStatus('idle');
        }
    };

    if (!problem) {
        notFound();
    }
    
    const getBadgeVariant = (difficulty: string) => {
        switch (difficulty) {
            case "Easy": return "default";
            case "Medium": return "secondary";
            case "Hard": return "destructive";
            default: return "outline";
        }
    };
    
    if (!mounted) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    const ConsoleStatus = () => {
        if (submissionStatus === 'running') {
            return (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Running...</span>
                </div>
            )
        }
        if (submissionStatus === 'success') {
            return (
                <div className="flex items-center gap-1.5 text-green-500 font-semibold text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Accepted</span>
                </div>
            )
        }
        if (submissionStatus === 'error') {
            return (
                <div className="flex items-center gap-1.5 text-red-500 font-semibold text-sm">
                    <XCircle className="h-4 w-4" />
                    <span>Error</span>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center justify-between p-2 border-b shrink-0 flex-wrap gap-2">
                <div className='flex items-center gap-2'>
                    <Link href="/prep-hub">
                        <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                    </Link>
                    <div>
                        <h1 className="text-lg md:text-xl font-semibold">{problem.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getBadgeVariant(problem.difficulty)}>{problem.difficulty}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleRun} disabled={isSubmitting || submissionStatus === 'running'}>
                        <Play className="mr-2 h-4 w-4" />
                        Run
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || submissionStatus === 'running'}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit
                    </Button>
                </div>
            </header>

            <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="flex-grow">
                <ResizablePanel defaultSize={isMobile ? 40 : 40} minSize={25}>
                    <Card className="h-full rounded-none border-0 border-r overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Problem Description</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                                <p>{problem.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {problem.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={isMobile ? 60 : 60} minSize={30}>
                    <ResizablePanelGroup direction="vertical" className="flex-grow">
                        <ResizablePanel defaultSize={70} minSize={30}>
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
                                    <div className="flex-grow" />
                                    <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
                                </div>
                                <div className="h-full w-full overflow-auto flex-grow">
                                   <CodeMirror 
                                        value={code}
                                        height="100%"
                                        className="h-full"
                                        theme={editorTheme}
                                        extensions={languageMap[language]}
                                        onChange={onCodeChange}
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
                        <ResizableHandle withHandle />
                         <ResizablePanel defaultSize={30} minSize={15}>
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between p-2 border-b">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Terminal className="h-5 w-5" />
                                        <span>Console</span>
                                    </div>
                                    <ConsoleStatus />
                                </div>
                                <div className="p-4 bg-muted/20 flex-grow overflow-y-auto">
                                    <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">{output}</pre>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
