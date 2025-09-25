
"use client"
import Link from "next/link";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { 
    CheckCircle2, 
    History, 
    Circle, 
    Building2, 
    Tags, 
    ArrowRight, 
    ArrowLeft, 
    Brackets, 
    Hash, 
    MoveHorizontal, 
    Layers, 
    Target, 
    SlidersHorizontal, 
    Link2, 
    Container, 
    BrainCircuit, 
    Type, 
    SortAsc,
    GitFork,
    Share2,
    CornerDownLeft,
    SpellCheck,
    MoreHorizontal,
    Award
} from "lucide-react";
import type problems from "@/data/codingProblems.json";
import { cn } from "@/lib/utils";

type Problem = (typeof problems)[0];

interface CodingPracticeClientProps {
  problems: Problem[];
  onStatusChange: (problemId: number, newStatus: string) => void;
}

export function CodingPracticeClient({ problems, onStatusChange }: CodingPracticeClientProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const getBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
        case "Easy": return "default";
        case "Medium": return "secondary";
        case "Hard": return "destructive";
        default: return "outline";
    }
  }

  const getStatusProps = (status: string) => {
    switch (status) {
      case "Solved":
        return { icon: CheckCircle2, className: "border-l-accent text-accent", text: "Solved" };
      case "Attempted":
        return { icon: History, className: "border-l-chart-4 text-chart-4", text: "Attempted" };
      case "To Do":
      default:
        return { icon: Circle, className: "border-l-muted-foreground/50 text-muted-foreground", text: "To Do" };
    }
  };

  const topics = [
    { name: "Array", icon: Brackets },
    { name: "Hash Table", icon: Hash },
    { name: "Two Pointers", icon: MoveHorizontal },
    { name: "Stack", icon: Layers },
    { name: "Binary Search", icon: Target },
    { name: "Sliding Window", icon: SlidersHorizontal },
    { name: "Linked List", icon: Link2 },
    { name: "Heap", icon: Container },
    { name: "Dynamic Programming", icon: BrainCircuit },
    { name: "String", icon: Type },
    { name: "Sorting", icon: SortAsc },
    { name: "Tree", icon: GitFork },
    { name: "Graph", icon: Share2 },
    { name: "Backtracking", icon: CornerDownLeft },
    { name: "Trie", icon: SpellCheck },
  ];

  const getTopicStats = (topicName: string) => {
    const problemsInTopic = problems.filter(p => p.tags.some(tag => tag.toLowerCase() === topicName.toLowerCase()));
    const solvedCount = problemsInTopic.filter(p => p.status === 'Solved').length;
    return {
      total: problemsInTopic.length,
      solved: solvedCount,
      isMastered: problemsInTopic.length > 0 && solvedCount === problemsInTopic.length,
    };
  };
  
  if (!selectedTopic) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {topics.map((topic) => {
          const stats = getTopicStats(topic.name);
          const Icon = topic.icon;
          return (
            <CardSpotlight
              key={topic.name}
              className={cn("p-6 cursor-pointer", stats.isMastered && "border-accent shadow-accent/20")}
              onClick={() => stats.total > 0 && setSelectedTopic(topic.name)}
              aria-disabled={stats.total === 0}
            >
              <div className="flex flex-col text-center items-center justify-center h-full relative">
                  {stats.isMastered && (
                    <Badge className="absolute -top-4 -right-4 bg-accent text-accent-foreground border-2 border-background gap-1.5 pl-2 pr-3">
                      <Award className="h-4 w-4" />
                      Mastered
                    </Badge>
                  )}
                  <Icon className={cn("h-12 w-12 text-foreground mb-4 mx-auto", stats.isMastered && "text-accent")} />
                  <h3 className="text-xl font-bold text-foreground">{topic.name}</h3>
                  <p className="mt-1 text-muted-foreground">{stats.solved} / {stats.total} Solved</p>
              </div>
            </CardSpotlight>
          )
        })}
      </div>
    );
  }

  const filteredProblems = problems.filter(p => p.tags.includes(selectedTopic));

  return (
    <div>
        <Button variant="outline" onClick={() => setSelectedTopic(null)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProblems.map((problem) => {
                const statusProps = getStatusProps(problem.status);
                const StatusIcon = statusProps.icon;
                return (
                    <Card key={problem.id} className={`p-0 flex flex-col border-l-8 rounded-lg ${statusProps.className}`}>
                        <div className="flex flex-col flex-grow p-6 h-full">
                            <div className="pb-4 flex-grow">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold leading-tight text-card-foreground">{problem.title}</h3>
                                        <div className={`flex items-center gap-1.5 text-sm font-medium pt-1 ${statusProps.className}`}>
                                            <StatusIcon className="h-4 w-4" />
                                            <span>{statusProps.text}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getBadgeVariant(problem.difficulty)} className="shrink-0 capitalize">{problem.difficulty}</Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-card-foreground hover:bg-secondary hover:text-secondary-foreground">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onStatusChange(problem.id, 'Solved')}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Solved
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onStatusChange(problem.id, 'Attempted')}>
                                                    <History className="mr-2 h-4 w-4" /> Mark as Attempted
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onStatusChange(problem.id, 'To Do')}>
                                                    <Circle className="mr-2 h-4 w-4" /> Mark as To Do
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-4">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Tags className="h-4 w-4"/> Topics</h4>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {problem.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                        </div>
                                    </div>
                                    {problem.companies && problem.companies.length > 0 && (
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Building2 className="h-4 w-4"/> Recently Asked By</h4>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {problem.companies.map((company) => <Badge key={company} variant="secondary">{company}</Badge>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-4">
                                <Link href={`/prep-hub/solve/${problem.id}`} className="w-full">
                                    <Button variant="outline" className="w-full group">
                                        {problem.status === "Solved" ? "Review Solution" : "Start Solving"}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    </div>
  );
}
