'use server';
/**
 * @fileOverview AI-powered job description generator.
 *
 * - generateJobDescription - A function that generates a job description based on a resume.
 * - GenerateJobDescriptionInput - The input type for the generateJobDescription function.
 * - GenerateJobDescriptionOutput - The return type for the generateJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJobDescriptionInputSchema = z.object({
  resume: z.string().describe('The resume of the candidate.'),
});
export type GenerateJobDescriptionInput = z.infer<
  typeof GenerateJobDescriptionInputSchema
>;

const GenerateJobDescriptionOutputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The generated job description based on the resume.'),
});
export type GenerateJobDescriptionOutput = z.infer<
  typeof GenerateJobDescriptionOutputSchema
>;

export async function generateJobDescription(
  input: GenerateJobDescriptionInput
): Promise<GenerateJobDescriptionOutput> {
  return generateJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJobDescriptionPrompt',
  input: {schema: GenerateJobDescriptionInputSchema},
  output: {schema: GenerateJobDescriptionOutputSchema},
  prompt: `You are an expert career advisor. Analyze the following resume and generate a detailed job description for a software engineering role that would be a perfect fit for this candidate.

The output should be a single string of well-formatted text, not a JSON object or code block.
The job description should include a title, a brief summary, and then separate lists for "Key Responsibilities" and "Qualifications". Use bolding for the title and section headers. Do not use asterisks or any other characters for bullet points. Each item in the list should be on a new line.
The total number of list items across both lists should not exceed 10.

Example format:
**Software Engineer**

A brief summary of the role goes here.

**Key Responsibilities:**
First responsibility...
Second responsibility...

**Qualifications:**
First qualification...
Second qualification...

Resume:
{{{resume}}}
`,
});

const generateJobDescriptionFlow = ai.defineFlow(
  {
    name: 'generateJobDescriptionFlow',
    inputSchema: GenerateJobDescriptionInputSchema,
    outputSchema: GenerateJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
