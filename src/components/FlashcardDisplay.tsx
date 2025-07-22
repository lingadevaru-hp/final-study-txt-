"use client";

import { useState, type FC } from 'react';
import { ClipboardCopy, Download, RotateCw } from 'lucide-react';
import type { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FlashcardDisplayProps {
  data: GenerateFlashcardsOutput;
}

const Flashcard: FC<{ front: string; back: string }> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full h-full flip-card" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={cn("flip-card-inner relative w-full h-full rounded-lg shadow-md", isFlipped && "flipped")}>
        <div className="flip-card-front absolute w-full h-full bg-card border rounded-lg flex flex-col justify-center items-center p-6 text-center">
            <p className="text-xl font-semibold">{front}</p>
        </div>
        <div className="flip-card-back absolute w-full h-full bg-primary text-primary-foreground border rounded-lg flex flex-col justify-center items-center p-6 text-center">
            <p className="text-xl font-medium">{back}</p>
        </div>
      </div>
    </div>
  );
};


const FlashcardDisplay: FC<FlashcardDisplayProps> = ({ data }) => {
  const { toast } = useToast();

  const formatForExport = () => {
    return data.flashcards.map(card => `Front: ${card.front}\nBack: ${card.back}`).join('\n\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatForExport());
    toast({ title: 'Copied to clipboard!', description: 'The flashcards have been copied.' });
  };

  const handleDownload = () => {
    const text = formatForExport();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Review Your Flashcards</CardTitle>
          <CardDescription>Click a card to flip it over.</CardDescription>
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
      <CardContent className="flex flex-col items-center">
        <Carousel className="w-full max-w-md" opts={{ loop: true }}>
          <CarouselContent>
            {data.flashcards.map((card, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <div className="aspect-video">
                     <Flashcard front={card.front} back={card.back} />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
         <div className="flex items-center text-sm text-muted-foreground mt-4">
            <RotateCw className="h-4 w-4 mr-2" />
            <span>Click on a card to flip it</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardDisplay;
