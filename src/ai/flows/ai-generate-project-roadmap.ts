'use server';
/**
 * @fileOverview AI-powered project roadmap generator.
 *
 * - generateProjectRoadmap - A function that generates a detailed project roadmap based on a user's skills.
 * - GenerateProjectRoadmapInput - The input type for the generateProjectRoadmap function.
 * - GenerateProjectRoadmapOutput - The return type for the generateProjectRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectRoadmapInputSchema = z.object({
  technologies: z
    .array(z.string())
    .describe("An array of technologies the user has mastered."),
});
export type GenerateProjectRoadmapInput = z.infer<
  typeof GenerateProjectRoadmapInputSchema
>;

const TaskSchema = z.object({
  id: z.string().describe("A unique identifier for the task, e.g., 'T01'"),
  title: z.string().describe("The title of the task."),
  description: z.string().describe("A brief description of the task."),
  category: z.enum(["Setup", "Backend", "Frontend", "Deployment", "Testing", "Documentation"])
});

const GenerateProjectRoadmapOutputSchema = z.object({
  projectName: z
    .string()
    .describe('A creative and professional name for the project.'),
  projectDescription: z
    .string()
    .describe('A brief, engaging description of the project.'),
  recommendedTechStack: z
    .array(z.string())
    .describe('A list of recommended technologies for this project.'),
  tasks: z
    .array(TaskSchema)
    .describe('A detailed, step-by-step list of tasks to build the project.'),
});
export type GenerateProjectRoadmapOutput = z.infer<
  typeof GenerateProjectRoadmapOutputSchema
>;

export async function generateProjectRoadmap(
  input: GenerateProjectRoadmapInput
): Promise<GenerateProjectRoadmapOutput> {
  return generateProjectRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectRoadmapPrompt',
  input: {schema: GenerateProjectRoadmapInputSchema},
  output: {schema: GenerateProjectRoadmapOutputSchema},
  prompt: `You are an expert software engineering mentor who creates project roadmaps for students. Based on the user's mastered technologies, generate a complete and detailed roadmap for a real-world project that would be impressive on a resume.

The project should be challenging but achievable. The roadmap must be broken down into clear, actionable tasks.

Technologies Mastered by User:
{{{technologies}}}

Generate the following:
1.  **Project Name:** A creative, professional-sounding name.
2.  **Project Description:** A 1-2 sentence summary of the project.
3.  **Recommended Tech Stack:** List the key technologies needed. This can include technologies the user already knows and 1-2 new, related technologies they can learn.
4.  **Tasks:** A step-by-step task list. Create at least 10 tasks. Group them into logical categories: "Setup", "Backend", "Frontend", and "Deployment". For each task, provide a unique ID, a clear title, a brief description, and its category.

Example Task:
{ id: "T01", title: "Initialize Project", description: "Set up a new Next.js project with TypeScript and Tailwind CSS.", category: "Setup" }
`,
  config: { temperature: 0.8 }
});

const generateProjectRoadmapFlow = ai.defineFlow(
  {
    name: 'generateProjectRoadmapFlow',
    inputSchema: GenerateProjectRoadmapInputSchema,
    outputSchema: GenerateProjectRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
