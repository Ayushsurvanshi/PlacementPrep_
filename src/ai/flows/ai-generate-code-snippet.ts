'use server';
/**
 * @fileOverview AI-powered code snippet generator.
 *
 * - generateCodeSnippet - A function that generates a code snippet for a given task.
 * - GenerateCodeSnippetInput - The input type for the generateCodeSnippet function.
 * - GenerateCodeSnippetOutput - The return type for the generateCodeSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeSnippetInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task for which to generate code.'),
  taskDescription: z.string().describe('The description of the task.'),
  techStack: z.array(z.string()).describe('The technology stack for the project.'),
  language: z.string().describe('The preferred programming language for the snippet.'),
});
export type GenerateCodeSnippetInput = z.infer<typeof GenerateCodeSnippetInputSchema>;

const GenerateCodeSnippetOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated code snippet.'),
});
export type GenerateCodeSnippetOutput = z.infer<typeof GenerateCodeSnippetOutputSchema>;

export async function generateCodeSnippet(
  input: GenerateCodeSnippetInput
): Promise<GenerateCodeSnippetOutput> {
  return generateCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeSnippetPrompt',
  input: {schema: GenerateCodeSnippetInputSchema},
  output: {schema: GenerateCodeSnippetOutputSchema},
  prompt: `You are an expert software developer. Generate a clean, high-quality code snippet in '{{language}}' for the following task. The project uses the following technologies: {{techStack}}.

Task Title: {{taskTitle}}
Task Description: {{taskDescription}}

Provide only the code snippet as the output. Do not include any explanations, markdown formatting, or surrounding text.
The code should be production-ready, follow best practices, and be easy to understand.
`,
  config: { temperature: 0.2 }
});

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: GenerateCodeSnippetInputSchema,
    outputSchema: GenerateCodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
