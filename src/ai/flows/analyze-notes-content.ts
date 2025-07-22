// src/ai/flows/analyze-notes-content.ts
'use server';

/**
 * @fileOverview Analyzes uploaded notes content to identify key concepts, terms, and definitions.
 *
 * - analyzeNotesContent - A function that handles the notes content analysis process.
 * - AnalyzeNotesContentInput - The input type for the analyzeNotesContent function.
 * - AnalyzeNotesContentOutput - The return type for the analyzeNotesContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeNotesContentInputSchema = z.object({
  notesContent: z.string().describe('The content of the notes to analyze.'),
});
export type AnalyzeNotesContentInput = z.infer<typeof AnalyzeNotesContentInputSchema>;

const AnalyzeNotesContentOutputSchema = z.object({
  keyConcepts: z.array(z.string()).describe('Key concepts identified in the notes.'),
  terms: z.array(z.string()).describe('Important terms and their definitions.'),
});
export type AnalyzeNotesContentOutput = z.infer<typeof AnalyzeNotesContentOutputSchema>;

export async function analyzeNotesContent(input: AnalyzeNotesContentInput): Promise<AnalyzeNotesContentOutput> {
  return analyzeNotesContentFlow(input);
}

const analyzeNotesContentPrompt = ai.definePrompt({
  name: 'analyzeNotesContentPrompt',
  input: {schema: AnalyzeNotesContentInputSchema},
  output: {schema: AnalyzeNotesContentOutputSchema},
  prompt: `You are an expert in analyzing notes and extracting key information.

  Analyze the following notes content and identify the key concepts, terms, and definitions.

  Notes Content: {{{notesContent}}}

  Return the key concepts and terms in JSON format.
  Ensure that the keyConcepts field only contains the key concepts, and the terms field contains the terms and definitions.
`,
});

const analyzeNotesContentFlow = ai.defineFlow(
  {
    name: 'analyzeNotesContentFlow',
    inputSchema: AnalyzeNotesContentInputSchema,
    outputSchema: AnalyzeNotesContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeNotesContentPrompt(input);
    return output!;
  }
);
