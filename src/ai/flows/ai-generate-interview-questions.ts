'use server';
/**
 * @fileOverview AI-powered interview question generator.
 *
 * - generateInterviewQuestions - A function that generates interview questions based on a resume and target company.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  resume: z.string().describe('The resume of the candidate.'),
  targetCompany: z.string().describe('The target company for the interview.'),
  interviewType: z
    .enum(['technical', 'hr'])
    .describe('The type of interview to be conducted.'),
});
export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const QuestionSchema = z.object({
  id: z.string().describe("A unique identifier for the question, e.g., 'Q001'"),
  type: z.enum(['behavioral', 'technical']).describe("The type of the question."),
  text: z.string().describe("The text of the interview question."),
});

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .describe('An array of generated interview questions.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<
  typeof GenerateInterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert AI Interviewer. Your task is to generate a personalized set of interview questions for a '{{interviewType}}' interview based on the provided resume and target company. Ensure the questions are diverse and avoid repetitive questions.

If the interviewType is 'technical', generate 13 questions. Two coding questions will be added separately later. The structure must be as follows:
1.  **Introduction (1 question):** Analyze the resume to find the candidate's name. The first question must be a behavioral question: "Tell me about yourself, [Candidate's Name]." If no name is found, use "Tell me about yourself."
2.  **CS Fundamentals (3 questions):** Generate 3 technical questions covering fundamental computer science topics like Operating Systems, Database Management Systems (DBMS), and Computer Networks.
3.  **Resume-Specific (5 questions):** Generate 5 more questions (a mix of technical and behavioral) that are highly specific to the content of the resume. These should be based on the candidate's projects, skills, work experience, and technologies mentioned.
4.  **Company-Specific (4 questions):** Generate 4 questions (a mix of technical and behavioral) that are typical for an interview at the specified Target Company. These should reflect the company's culture and technical focus (e.g., leadership principles for Amazon, system design for Google/Meta).
For technical questions, set the type to 'technical'.

If the interviewType is 'hr', generate 15 questions. The question structure must focus on behavioral and situational questions. Do NOT ask coding questions or deep technical algorithm questions.
1.  **Introduction (1 question):** "Tell me about yourself and what led you to apply for this role at {{targetCompany}}."
2.  **Motivation and Goals (3 questions):** Generate 3 questions about the candidate's career aspirations, why they're interested in {{targetCompany}}, and what motivates them.
3.  **Resume-Based Behavioral (5 questions):** Generate 5 behavioral questions based on experiences and projects listed in the resume. These questions should prompt the candidate to use the STAR (Situation, Task, Action, Result) method. For example: "Tell me about a challenging project from your resume. What was your specific role?"
4.  **Teamwork and Collaboration (3 questions):** Generate 3 questions about how the candidate works in a team, handles disagreements, and communicates with others.
5.  **Situational & Cultural Fit (3 questions):** Generate 3 questions to assess how the candidate might handle workplace scenarios and if they align with the company's values.
For HR interviews, set the type for all questions to 'behavioral'.

Each question must have a unique ID (Q001, Q002, etc.), a type ('technical' or 'behavioral'), and the question text.

Resume:
{{{resume}}}

Target Company:
{{{targetCompany}}}
`,
  config: { temperature: 0.9 }
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
