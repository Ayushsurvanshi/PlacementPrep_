'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodingPracticeClient } from './components/coding-practice-client';
import { MockInterviewClient } from './components/mock-interview-client';
import { ProgressTrackingClient } from './components/progress-tracking-client';
import { Bot, BarChart3, Target } from 'lucide-react';
import problemsData from '@/data/codingProblems.json';

type Problem = (typeof problemsData)[0];

export default function PrepHubPage() {
  const [problems, setProblems] = useState<Problem[]>(problemsData);

  const handleStatusChange = (problemId: number, newStatus: string) => {
    setProblems(prevProblems =>
      prevProblems.map(p =>
        p.id === problemId ? { ...p, status: newStatus } : p
      )
    );
  };

  const triggerClasses = "py-3 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent hover:bg-muted/50 transition-colors duration-300";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Placement Prep Hub</h1>
          <p className="text-muted-foreground mt-2">
            Your all-in-one toolkit for acing technical interviews and landing your dream job.
          </p>
        </div>
      </div>

      <Tabs defaultValue="coding-practice" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto bg-transparent p-0 border-b rounded-none">
          <TabsTrigger value="coding-practice" className={triggerClasses}>
            <Target className="mr-2 h-5 w-5" />
            Coding Practice
          </TabsTrigger>
          <TabsTrigger value="mock-interview" className={triggerClasses}>
            <Bot className="mr-2 h-5 w-5" />
            AI Mock Interview
          </TabsTrigger>
          <TabsTrigger value="progress-tracking" className={triggerClasses}>
            <BarChart3 className="mr-2 h-5 w-5" />
            Progress Tracking
          </TabsTrigger>
        </TabsList>
        <TabsContent value="coding-practice" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Target className="w-8 h-8 text-accent" />
                <div>
                  <CardTitle className="text-2xl">Targeted Interview Questions</CardTitle>
                  <CardDescription>
                    This is a targeted list of problems frequently asked by top tech companies. Master these to boost your confidence.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
          <div className="mt-6">
            <CodingPracticeClient
              problems={problems}
              onStatusChange={handleStatusChange}
            />
          </div>
        </TabsContent>
        <TabsContent value="mock-interview" className="mt-6">
          <MockInterviewClient />
        </TabsContent>
        <TabsContent value="progress-tracking" className="mt-6">
          <ProgressTrackingClient problems={problems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
