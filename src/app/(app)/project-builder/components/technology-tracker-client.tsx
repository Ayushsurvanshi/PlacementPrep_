"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const techCategories = {
  "Frontend": ["React", "Next.js", "Vue", "Angular", "Tailwind CSS", "TypeScript"],
  "Backend": ["Node.js", "Express", "Python", "Django", "Ruby on Rails", "Go"],
  "Databases": ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
  "DevOps & Cloud": ["Docker", "Kubernetes", "AWS", "Google Cloud", "CI/CD"],
  "Mobile": ["React Native", "Swift", "Kotlin", "Flutter"],
};

type TechState = {
    [key: string]: boolean;
};

interface TechnologyTrackerClientProps {
  onTechSelectionChange: (techs: string[]) => void;
}

export function TechnologyTrackerClient({ onTechSelectionChange }: TechnologyTrackerClientProps) {
  const allTechs = Object.values(techCategories).flat();
  const initialTechState = allTechs.reduce((acc, tech) => ({ ...acc, [tech]: false }), {});
  
  const [techState, setTechState] = useState<TechState>(initialTechState);
  const [progress, setProgress] = useState(0);

  const masteredCount = Object.values(techState).filter(Boolean).length;
  const totalCount = allTechs.length;

  useEffect(() => {
    const selectedTechs = Object.entries(techState)
      .filter(([, isSelected]) => isSelected)
      .map(([tech]) => tech);
    onTechSelectionChange(selectedTechs);
    
    const progressPercentage = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;
    const timer = setTimeout(() => setProgress(progressPercentage), 300);
    return () => clearTimeout(timer);
  }, [techState, onTechSelectionChange, totalCount, masteredCount]);

  const handleTechChange = (tech: string) => {
    setTechState(prevState => ({
      ...prevState,
      [tech]: !prevState[tech]
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Technology Mastery</CardTitle>
        <CardDescription>Select the technologies you've mastered. This will help the AI generate a relevant project roadmap.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="my-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
                <p className="font-medium text-card-foreground">Your Progress</p>
                <p className="text-muted-foreground">{masteredCount} / {totalCount} technologies mastered</p>
            </div>
            <Progress value={progress} className="w-full h-2 [&>div]:bg-accent" />
        </div>

        <div className="space-y-4 mt-6">
            {Object.entries(techCategories).map(([category, techs]) => (
                <div key={category}>
                    <h3 className="font-semibold text-lg mb-3">{category}</h3>
                    <motion.div 
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                        {techs.map((tech) => (
                            <motion.div key={tech} variants={itemVariants}>
                                <Label 
                                    htmlFor={tech} 
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                                        techState[tech] 
                                            ? "border-accent bg-accent/10 text-accent" 
                                            : "border-border bg-transparent hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    <Checkbox 
                                        id={tech} 
                                        checked={techState[tech]}
                                        onCheckedChange={() => handleTechChange(tech)}
                                        className="sr-only"
                                    />
                                    <span className="text-sm font-medium text-center">{tech}</span>
                                </Label>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
