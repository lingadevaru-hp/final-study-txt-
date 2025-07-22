"use client";

import type { FC } from 'react';
import { ClipboardCopy } from 'lucide-react';
import type { AnalyzeNotesContentOutput } from '@/ai/flows/analyze-notes-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

interface AnalysisDisplayProps {
  data: AnalyzeNotesContentOutput;
}

const AnalysisDisplay: FC<AnalysisDisplayProps> = ({ data }) => {
  const { toast } = useToast();

  const formatForCopy = () => {
    let text = 'Key Concepts:\n';
    text += data.keyConcepts.join(', ') + '\n\n';
    text += 'Terms & Definitions:\n';
    text += data.terms.join('\n');
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatForCopy());
    toast({
      title: 'Copied to clipboard!',
      description: 'The analysis has been copied.',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Key Concepts & Terms</CardTitle>
          <CardDescription>An AI-powered summary of your notes.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleCopy}>
          <ClipboardCopy className="h-4 w-4" />
          <span className="sr-only">Copy</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Key Concepts</h3>
          <div className="flex flex-wrap gap-2">
            {data.keyConcepts.map((concept, index) => (
              <Badge key={index} variant="secondary" className="text-base py-1 px-3">{concept}</Badge>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-semibold mb-3">Terms & Definitions</h3>
          <ul className="space-y-4">
            {data.terms.map((term, index) => (
              <li key={index} className="p-3 bg-secondary/30 rounded-md border-l-4 border-primary">
                {term}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisDisplay;
