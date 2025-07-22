"use client";

import type { FC } from 'react';
import { ClipboardCopy, Download, Lightbulb, ListChecks, PenLine, ChevronRight } from 'lucide-react';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface QuizDisplayProps {
  data: GenerateQuizOutput;
}

const questionTypeIcons = {
  multiple_choice: <ListChecks className="h-4 w-4" />,
  true_false: <ChevronRight className="h-4 w-4" />,
  short_answer: <PenLine className="h-4 w-4" />,
};

const QuizDisplay: FC<QuizDisplayProps> = ({ data }) => {
  const { toast } = useToast();

  const formatForExport = () => {
    return data.questions.map((q, i) => {
      let text = `Q${i + 1}: ${q.question}\n`;
      if (q.type === 'multiple_choice' && q.answers) {
        text += q.answers.map((a, j) => `  ${String.fromCharCode(97 + j)}) ${a}`).join('\n') + '\n';
      }
      text += `Answer: ${q.correctAnswer}\n`;
      return text;
    }).join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatForExport());
    toast({ title: 'Copied to clipboard!', description: 'The quiz has been copied.' });
  };

  const handleDownload = () => {
    const text = formatForExport();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Test Your Knowledge</CardTitle>
          <CardDescription>A quiz generated from your notes. Click a question to reveal the answer.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <ClipboardCopy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {data.questions.map((q, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4 bg-background">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-start gap-3">
                  <span className="mt-1 font-bold">{index + 1}.</span>
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {questionTypeIcons[q.type]}
                      <span className="ml-1.5 capitalize">{q.type.replace('_', ' ')}</span>
                    </Badge>
                    <p>{q.question}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {q.type === 'multiple_choice' && q.answers && (
                  <ul className="space-y-2 mb-4 pl-8">
                    {q.answers.map((answer, i) => (
                      <li key={i} className="flex items-center">
                         <span className="font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                         <span>{answer}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-2 p-3 rounded-md bg-primary/10 text-primary-foreground border border-primary/20">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                    <p className="font-semibold text-primary">{q.correctAnswer}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default QuizDisplay;
