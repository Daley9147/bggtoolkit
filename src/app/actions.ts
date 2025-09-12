'use server';

import { generateTalkingPoints, type GenerateTalkingPointsInput } from '@/ai/flows/generate-talking-points';

export async function getAiTalkingPoints(input: GenerateTalkingPointsInput) {
    try {
        const result = await generateTalkingPoints(input);
        return { success: true, data: result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while generating talking points.';
        console.error('AI Action Error:', errorMessage);
        return { success: false, error: errorMessage };
    }
}
