
"use client"
import { useState, useRef, useEffect, FormEvent } from "react";
import { recommendCareersAction } from "@/app/(app)/career-guide/actions";
import type { CareerRecommendationOutput } from "@/ai/flows/ai-smart-career-guide";
import { Loader2, DollarSign, Building, Briefcase, Lightbulb, BarChart3, ChevronRight, BotMessageSquare, Send, User, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";

type Message = {
    id: string;
    sender: 'user' | 'bot';
    content: string;
};

const questions = [
    "First, what are some of your top skills? Please separate them with commas (e.g., React, Node.js, Python).",
    "Great. Now, what's your current experience level? (e.g., Entry-level, Mid-level, Senior-level)",
    "And lastly, what's your preferred industry? (e.g., FinTech, Healthcare, E-commerce)",
];

export function CareerGuideClient() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<CareerRecommendationOutput | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([
            {
                id: `bot-start`,
                sender: 'bot',
                content: "Hello! I'm your AI Career Guide. I'm here to provide personalized career recommendations based on your profile. Let's get started."
            },
            {
                id: `bot-q-0`,
                sender: 'bot',
                content: questions[0]
            }
        ]);
    }, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: Message = {
            id: `user-${currentStep}`,
            sender: 'user',
            content: userInput
        };

        const updatedAnswers = [...userAnswers, userInput];
        setUserAnswers(updatedAnswers);
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');

        if (currentStep < questions.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            setTimeout(() => {
                 setMessages(prev => [...prev, { id: `bot-q-${nextStep}`, sender: 'bot', content: questions[nextStep] }]);
            }, 500)
        } else {
            setIsLoading(true);
            try {
                const result = await recommendCareersAction({
                    skills: updatedAnswers[0].split(',').map(skill => skill.trim()).filter(Boolean),
                    experienceLevel: updatedAnswers[1],
                    preferredIndustry: updatedAnswers[2],
                });
                
                setTimeout(() => {
                    setRecommendations(result);
                }, 1000);

            } catch (error) {
                console.error(error);
                setMessages(prev => [...prev, { id: 'bot-error', sender: 'bot', content: "Sorry, I encountered an error while generating your guide. Please try refreshing the page." }]);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const resetGuide = () => {
        setMessages([
            {
                id: `bot-start`,
                sender: 'bot',
                content: "Hello! I'm your AI Career Guide. I'm here to provide personalized career recommendations based on your profile. Let's get started."
            },
            {
                id: `bot-q-0`,
                sender: 'bot',
                content: questions[0]
            }
        ]);
        setCurrentStep(0);
        setUserInput('');
        setUserAnswers([]);
        setIsLoading(false);
        setRecommendations(null);
    }

    if (recommendations) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <div className="text-center">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><Sparkles className="h-6 w-6 text-accent"/> Here is your personalized Career Guide:</h2>
                </div>
                
                <Card className="bg-gradient-to-br from-accent/20 to-transparent">
                    <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                        <div className="p-3 rounded-full bg-accent/10 border border-accent/20">
                            <DollarSign className="h-6 w-6 text-accent" />
                        </div>
                        <h4 className="font-semibold text-card-foreground">Predicted Salary Range</h4>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-accent">{recommendations.salaryRange}</p>
                        <p className="text-xs text-muted-foreground pt-1">Based on your skills and experience in the Indian market.</p>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Briefcase className="h-5 w-5 text-primary" />
                                Suggested Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {recommendations.suggestedRoles.map(role => <Badge key={role} variant="secondary" className="text-sm px-3 py-1">{role}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Building className="h-5 w-5 text-primary" />
                                Recommended Companies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {recommendations.recommendedCompanies.map(company => <Badge key={company} variant="secondary" className="text-sm px-3 py-1">{company}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Skills Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{recommendations.skillsGraphExplanation}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Next Skills to Learn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {recommendations.nextSkillsToLearn.map(skill => (
                                <li key={skill} className="flex items-center text-foreground p-3 rounded-lg bg-muted/50 border border-border/50">
                                    <ChevronRight className="h-5 w-5 mr-3 text-accent" />
                                    <span className="font-medium">{skill}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Button onClick={resetGuide} className="w-full">Start Over</Button>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-14rem)] max-w-4xl mx-auto">
            <Card className="flex-grow flex flex-col bg-card/50">
                <div ref={scrollAreaRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ duration: 0.4, type: "spring", stiffness: 150, damping: 20 }}
                                className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}
                            >
                                {message.sender === 'bot' && (
                                    <Avatar className="h-10 w-10 border-2 border-accent/30">
                                        <AvatarFallback className="bg-accent/10 text-accent"><BotMessageSquare/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-xl rounded-2xl px-5 py-3 shadow-sm ${
                                    message.sender === 'user' 
                                    ? 'rounded-br-none bg-primary text-primary-foreground' 
                                    : 'rounded-bl-none bg-background border'
                                }`}>
                                    <p>{message.content as string}</p>
                                </div>
                                {message.sender === 'user' && (
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback><User/></AvatarFallback>
                                    </Avatar>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start gap-4"
                        >
                            <Avatar className="h-10 w-10 border-2 border-accent/30">
                                <AvatarFallback className="bg-accent/10 text-accent"><BotMessageSquare/></AvatarFallback>
                            </Avatar>
                             <div className="max-w-lg rounded-2xl rounded-bl-none px-5 py-4 bg-background border shadow-sm flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                                <span className="text-muted-foreground font-medium">Generating your personalized guide...</span>
                             </div>
                        </motion.div>
                    )}
                </div>

                <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-3 max-w-4xl mx-auto">
                        <Input 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isLoading ? "Analyzing..." : "Type your answer here..."}
                            disabled={isLoading || currentStep >= questions.length}
                            className="flex-grow h-11"
                        />
                        <Button type="submit" size="icon" className="h-11 w-11" disabled={isLoading || !userInput.trim()}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
