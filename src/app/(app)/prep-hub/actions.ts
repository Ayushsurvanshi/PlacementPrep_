"use server"

import { getMockInterviewFeedback, MockInterviewFeedbackInput } from "@/ai/flows/ai-mock-interview-feedback";
import { generateJobDescription, GenerateJobDescriptionInput } from "@/ai/flows/ai-generate-job-description";
import { generateInterviewQuestions, GenerateInterviewQuestionsInput } from "@/ai/flows/ai-generate-interview-questions";

export async function getMockInterviewFeedbackAction(input: MockInterviewFeedbackInput) {
    return await getMockInterviewFeedback(input);
}

export async function generateJobDescriptionAction(input: GenerateJobDescriptionInput) {
    return await generateJobDescription(input);
}

export async function generateInterviewQuestionsAction(input: GenerateInterviewQuestionsInput) {
    return await generateInterviewQuestions(input);
}
