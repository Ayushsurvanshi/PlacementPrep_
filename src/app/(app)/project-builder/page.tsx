
'use client';

import { useState } from 'react';
import { TechnologyTrackerClient } from './components/technology-tracker-client';
import { ProjectRoadmapClient } from './components/project-roadmap-client';
import { generateProjectRoadmapAction } from './actions';
import type { GenerateProjectRoadmapOutput } from '@/ai/flows/ai-generate-project-roadmap';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProjectBuilderPage() {
  const [masteredTech, setMasteredTech] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<GenerateProjectRoadmapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateRoadmap = async () => {
    if (masteredTech.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Not Enough Skills',
        description: 'Please select at least two technologies you have mastered to generate a project idea.',
      });
      return;
    }

    setIsLoading(true);
    setRoadmap(null); // Clear previous roadmap immediately

    try {
      const result = await generateProjectRoadmapAction({ technologies: masteredTech });
      setRoadmap(result);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Roadmap Generation Failed',
        description: 'An error occurred while generating the project roadmap. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Project Builder</h1>
        <p className="text-muted-foreground mt-2">
          Master in-demand technologies by building real-world projects with a personalized roadmap.
        </p>
      </div>

      <TechnologyTrackerClient onTechSelectionChange={setMasteredTech} />
      
      <div className="text-center">
        <Button size="lg" onClick={handleGenerateRoadmap} disabled={isLoading || masteredTech.length < 2}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Your Roadmap...
            </>
          ) : (
            <>
              <BrainCircuit className="mr-2 h-5 w-5" />
              Generate Project Roadmap
            </>
          )}
        </Button>
      </div>
      
      <ProjectRoadmapClient roadmap={roadmap} isLoading={isLoading} />

    </div>
  );
}
