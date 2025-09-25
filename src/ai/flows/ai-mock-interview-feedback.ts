'use server';
/**
 * @fileOverview AI-powered feedback on mock interviews.
 *
 * - getMockInterviewFeedback - A function that handles the process of providing AI feedback on mock interviews.
 * - MockInterviewFeedbackInput - The input type for the getMockInterviewFeedback function.
 * - MockInterviewFeedbackOutput - The return type for the getMockInterviewFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MockInterviewFeedbackInputSchema = z.object({
  interviewTranscript: z
    .string()
    .describe('The transcript of the mock interview.'),
  jobDescription: z.string().describe('The job description for the role.'),
  resume: z.string().describe('The resume of the candidate.'),
});
export type MockInterviewFeedbackInput = z.infer<
  typeof MockInterviewFeedbackInputSchema
>;

const MockInterviewFeedbackOutputSchema = z.object({
  overallFeedback: z.string().describe('Overall feedback on the interview.'),
  strengths: z.string().describe('The strengths of the candidate.'),
  areasForImprovement: z
    .string()
    .describe('Areas for improvement for the candidate.'),
  technicalFeedback: z.string().describe('Technical feedback on the interview.'),
  communicationFeedback: z
    .string()
    .describe('Communication feedback on the interview.'),
  overallScore: z
    .number()
    .describe(
      'An overall score for the interview performance, from 0 to 100, based on all feedback categories.'
    ),
});
export type MockInterviewFeedbackOutput = z.infer<
  typeof MockInterviewFeedbackOutputSchema
>;

export async function getMockInterviewFeedback(
  input: MockInterviewFeedbackInput
): Promise<MockInterviewFeedbackOutput> {
  return mockInterviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mockInterviewFeedbackPrompt',
  input: {schema: MockInterviewFeedbackInputSchema},
  output: {schema: MockInterviewFeedbackOutputSchema},
  prompt: `You are an AI interview coach providing feedback on mock interviews.

  Analyze the interview transcript, job description, and resume to provide constructive feedback to the candidate.

  Job Description: {{{jobDescription}}}
  Resume: {{{resume}}}
  Interview Transcript: {{{interviewTranscript}}}

  Provide feedback in the following areas:
  - Overall Feedback
  - Strengths
  - Areas for Improvement
  - Technical Feedback
  - Communication Feedback

  Some questions may be coding questions, marked with \`Question: [CODING] ...\`. For these questions, the answer will be a code block. You must evaluate the code for the following:
  - Correctness: Does it solve the problem?
  - Efficiency: Is the approach optimal (e.g., time and space complexity)?
  - Code Quality: Is the code clean, readable, and well-structured?
  Incorporate this analysis specifically into the 'Technical Feedback' section of your response.

  Finally, provide an 'overallScore' from 0 to 100 based on your complete analysis. The score should holistically evaluate the candidate's technical accuracy, problem-solving skills (including code), communication clarity, and alignment with the job description.
  `,
});

const mockInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'mockInterviewFeedbackFlow',
    inputSchema: MockInterviewFeedbackInputSchema,
    outputSchema: MockInterviewFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
