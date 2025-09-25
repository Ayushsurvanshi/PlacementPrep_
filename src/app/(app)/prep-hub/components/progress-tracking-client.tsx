"use client"
import { useState, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { PieChart, Pie, Cell } from 'recharts';
import type problems from "@/data/codingProblems.json";
import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type Problem = (typeof problems)[0];

interface ProgressTrackingClientProps {
  problems: Problem[];
}

const COLORS = ['hsl(var(--accent))', 'hsl(var(--chart-4))', 'hsl(var(--muted-foreground))'];

export function ProgressTrackingClient({ problems }: ProgressTrackingClientProps) {
  const [interviewScores, setInterviewScores] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
      const storedHistory = localStorage.getItem('interviewHistory');
      if (storedHistory) {
          setInterviewScores(JSON.parse(storedHistory));
      }
  }, []);

  // --- Dynamic Data Calculation ---
  
  // 1. Calculate problem solving status for the Pie Chart
  const problemStatusCounts = problems.reduce((acc, problem) => {
    acc[problem.status] = (acc[problem.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const problemStatusData = [
    { name: 'Solved', value: problemStatusCounts['Solved'] || 0 },
    { name: 'Attempted', value: problemStatusCounts['Attempted'] || 0 },
    { name: 'To Do', value: problemStatusCounts['To Do'] || 0 },
  ].filter(item => item.value > 0); // Only show categories with problems

  // 2. Calculate skill proficiency for the Bar Chart
  const topicShortNames: Record<string, string> = {
    "Dynamic Programming": "Dyn. Prog.",
    "Sliding Window": "Slid. Win.",
    "Two Pointers": "Two Ptrs",
    "Linked List": "Link. List",
    "Binary Search": "Bin. Search",
    "Hash Table": "Hash Tbl.",
  };

  const allTopics = [...new Set(problems.flatMap(p => p.tags))];
  const skillData = allTopics.map(topic => {
      const problemsInTopic = problems.filter(p => p.tags.includes(topic));
      const solvedProblems = problemsInTopic.filter(p => p.status === "Solved").length;
      const totalProblems = problemsInTopic.length;
      const proficiency = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
      
      return { 
        name: topicShortNames[topic] || topic, // Short name for display
        fullName: topic, // Full name for tooltip
        value: proficiency 
      };
  }).sort((a, b) => b.value - a.value); // Sort by highest proficiency

  // --- Custom Tooltip for Skill Chart ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Topic
                        </span>
                        <span className="font-bold text-muted-foreground">
                            {data.fullName}
                        </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Proficiency
                        </span>
                        <span className="font-bold text-foreground">
                            {data.value}%
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
  };


  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Skill Proficiency</CardTitle>
          <CardDescription>Your proficiency in key topics based on solved problems.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
              <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<CustomTooltip />}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Mock Interview Scores</CardTitle>
          <CardDescription>Your performance over time in mock interviews.</CardDescription>
        </CardHeader>
        <CardContent>
          {interviewScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={interviewScores} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                  <Bar dataKey="score" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
          ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-4" />
                  <p className="font-semibold text-card-foreground">No Interview Data Yet</p>
                  <p className="text-sm">Complete a mock interview in the "AI Mock Interview" tab to see your progress.</p>
              </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
            <CardTitle>Problem Solving Status</CardTitle>
            <CardDescription>Overview of your progress on coding problems from the list.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-center items-center">
              <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                      <Pie data={problemStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {problemStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}}/>
                      <Legend />
                  </PieChart>
              </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
