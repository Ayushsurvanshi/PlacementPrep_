"use server"

import { generateProjectRoadmap, GenerateProjectRoadmapInput } from "@/ai/flows/ai-generate-project-roadmap";
import { generateCodeSnippet, GenerateCodeSnippetInput } from "@/ai/flows/ai-generate-code-snippet";

export async function generateProjectRoadmapAction(input: GenerateProjectRoadmapInput) {
    return await generateProjectRoadmap(input);
}

export async function generateCodeSnippetAction(input: GenerateCodeSnippetInput) {
    return await generateCodeSnippet(input);
}
