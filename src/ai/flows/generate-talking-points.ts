'use server';

/**
 * @fileOverview An AI agent for generating talking points based on content and keywords.
 *
 * - generateTalkingPoints - A function that generates talking points.
 * - GenerateTalkingPointsInput - The input type for the generateTalkingPoints function.
 * - GenerateTalkingPointsOutput - The return type for the generateTalkingPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTalkingPointsInputSchema = z.object({
  content: z.string().describe('The content to generate talking points from.'),
  keywords: z.string().describe('Keywords or client profile to tailor the talking points.'),
});
export type GenerateTalkingPointsInput = z.infer<typeof GenerateTalkingPointsInputSchema>;

const GenerateTalkingPointsOutputSchema = z.object({
  talkingPoints: z.string().describe('Generated talking points tailored to the keywords.'),
});
export type GenerateTalkingPointsOutput = z.infer<typeof GenerateTalkingPointsOutputSchema>;

export async function generateTalkingPoints(input: GenerateTalkingPointsInput): Promise<GenerateTalkingPointsOutput> {
  return generateTalkingPointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTalkingPointsPrompt',
  input: {schema: GenerateTalkingPointsInputSchema},
  output: {schema: GenerateTalkingPointsOutputSchema},
  prompt: `You are an expert sales assistant. Generate concise and persuasive talking points based on the following content and tailored to the specified keywords/client profile.\n\nContent: {{{content}}}\n\nKeywords/Client Profile: {{{keywords}}}\n\nTalking Points:`, // Ensure the prompt ends with "Talking Points:"
});

const generateTalkingPointsFlow = ai.defineFlow(
  {
    name: 'generateTalkingPointsFlow',
    inputSchema: GenerateTalkingPointsInputSchema,
    outputSchema: GenerateTalkingPointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
