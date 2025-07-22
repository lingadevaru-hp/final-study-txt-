'use server';

/**
 * @fileOverview Generates a quiz from uploaded notes.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  notesContent: z.string().describe('The content of the notes to generate a quiz from.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuestionSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']).describe('The type of question.'),
  question: z.string().describe('The text of the question.'),
  answers: z.array(z.string()).optional().describe('The possible answers for multiple choice questions.'),
  correctAnswer: z.string().optional().describe('The correct answer for multiple choice and short answer questions.'),
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert in generating quizzes from notes.

  Given the following notes, generate a quiz with multiple choice, true/false, and short answer questions.
  The quiz should cover the key concepts, terms, and definitions in the notes.

  Notes:
  {{notesContent}}

  The output should be a JSON object with an array of questions. Each question should have a type (multiple_choice, true_false, short_answer), a question, and optionally answers and a correct answer, formatted according to the schema.
  Make sure the output is valid JSON.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
