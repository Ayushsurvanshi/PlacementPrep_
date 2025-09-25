// use server'
'use server';
/**
 * @fileOverview AI-powered career guide to provide personalized recommendations for students.
 *
 * - recommendCareers - A function that takes a student's skills and generates career recommendations.
 * - CareerRecommendationInput - The input type for the recommendCareers function.
 * - CareerRecommendationOutput - The return type for the recommendCareers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerRecommendationInputSchema = z.object({
  skills: z
    .array(z.string())
    .describe('An array of skills possessed by the student.'),
  experienceLevel: z
    .string()
    .optional()
    .describe('The experience level of the student (e.g., Entry-level, Mid-level, Senior-level).'),
  preferredIndustry: z
    .string()
    .optional()
    .describe('The preferred industry of the student (e.g., Software, Finance, Healthcare).'),
});
export type CareerRecommendationInput = z.infer<typeof CareerRecommendationInputSchema>;

const CareerRecommendationOutputSchema = z.object({
  recommendedCompanies: z
    .array(z.string())
    .describe('A list of companies recommended for the student.'),
  suggestedRoles: z
    .array(z.string())
    .describe('A list of roles that match your skill set.'),
  salaryRange: z
    .string()
    .describe('The predicted salary range based on the student skills and experience.'),
  skillsGraphExplanation: z
    .string()
    .describe('An explanation of how your skills map to possible career outcomes'),
  nextSkillsToLearn: z
    .array(z.string())
    .describe('The next skills that should be learned to boost the chances of placement'),
});
export type CareerRecommendationOutput = z.infer<typeof CareerRecommendationOutputSchema>;

export async function recommendCareers(input: CareerRecommendationInput): Promise<CareerRecommendationOutput> {
  return recommendCareersFlow(input);
}

const recommendCareersPrompt = ai.definePrompt({
  name: 'recommendCareersPrompt',
  input: {schema: CareerRecommendationInputSchema},
  output: {schema: CareerRecommendationOutputSchema},
  prompt: `You are a career advisor AI specializing in providing personalized career recommendations to CS students in India.

You will analyze the student's skills, experience level, and preferred industry to generate relevant recommendations.

Skills: {{skills}}
Experience Level: {{experienceLevel}}
Preferred Industry: {{preferredIndustry}}

Based on this information, suggest the following:

*   A list of companies that would be a good fit for the student.
*   A predicted salary range in Indian Rupees (INR) based on the student skills and experience. The format should be like '₹X,XX,XXX - ₹Y,YY,YYY'.
*   A skills graph explanation which maps the student's skills to potential career outcomes.
*   What the next skills to learn should be, in order to maximize chances of placement
*   Suggest roles that match the user's skill set

Make sure you answer in a professional, concise manner that the student will understand.

Output should be formatted as a JSON object.
`,
});

const recommendCareersFlow = ai.defineFlow(
  {
    name: 'recommendCareersFlow',
    inputSchema: CareerRecommendationInputSchema,
    outputSchema: CareerRecommendationOutputSchema,
  },
  async input => {
    const {output} = await recommendCareersPrompt(input);
    return output!;
  }
);
