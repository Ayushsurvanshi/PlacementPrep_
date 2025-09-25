"use server"

import { recommendCareers, CareerRecommendationInput } from "@/ai/flows/ai-smart-career-guide";

export async function recommendCareersAction(input: CareerRecommendationInput) {
    return await recommendCareers(input);
}
