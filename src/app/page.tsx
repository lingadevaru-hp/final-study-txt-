"use client";

import { useState, useMemo, type FC } from "react";
import {
  UploadCloud,
  FileText,
  X,
  BrainCircuit,
  ListChecks,
  Layers,
  Loader2,
  BookOpenCheck,
} from "lucide-react";
import { analyzeNotesContent, type AnalyzeNotesContentOutput } from "@/ai/flows/analyze-notes-content";
import { generateQuiz, type GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { generateFlashcards, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import AnalysisDisplay from "@/components/AnalysisDisplay";
import QuizDisplay from "@/components/QuizDisplay";
import FlashcardDisplay from "@/components/FlashcardDisplay";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingTool = "analysis" | "quiz" | "flashcards" | null;

export default function NotePrepAI() {
  const [notesContent, setNotesContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [analysis, setAnalysis] = useState<AnalyzeNotesContentOutput | null>(null);
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput | null>(null);

  const [loadingTool, setLoadingTool] = useState<LoadingTool>(null);
  const [activeTab, setActiveTab] = useState<string>("analysis");
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file && (file.type === "text/plain" || file.name.endsWith(".txt"))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setNotesContent(text);
        setFileName(file.name);
        // Reset generated content
        setAnalysis(null);
        setQuiz(null);
        setFlashcards(null);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Unsupported File Type",
        description: "Please upload a .txt file. PDF support is coming soon!",
        variant: "destructive",
      });
    }
  };

  const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, inZone: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(inZone);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const clearFile = () => {
    setNotesContent(null);
    setFileName(null);
    setAnalysis(null);
    setQuiz(null);
    setFlashcards(null);
  };
  
  const handleGenerate = async (tool: 'analysis' | 'quiz' | 'flashcards') => {
    if (!notesContent) {
      toast({ title: "No notes uploaded", description: "Please upload your notes first.", variant: "destructive" });
      return;
    }
    setLoadingTool(tool);
    try {
      if (tool === 'analysis') {
        const result = await analyzeNotesContent({ notesContent });
        setAnalysis(result);
        setActiveTab('analysis');
      } else if (tool === 'quiz') {
        const result = await generateQuiz({ notesContent });
        setQuiz(result);
        setActiveTab('quiz');
      } else if (tool === 'flashcards') {
        const result = await generateFlashcards({ notes: notesContent });
        setFlashcards(result);
        setActiveTab('flashcards');
      }
    } catch (error) {
      console.error(`Error generating ${tool}:`, error);
      toast({ title: "An error occurred", description: `Failed to generate ${tool}. Please try again.`, variant: "destructive" });
    } finally {
      setLoadingTool(null);
    }
  };

  const hasGeneratedContent = useMemo(() => analysis || quiz || flashcards, [analysis, quiz, flashcards]);

  const LoadingIndicator: FC<{tool: LoadingTool}> = ({ tool }) => (
    <Card className="mt-8">
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">NotePrepAI</h1>
        </div>
        <p className="text-muted-foreground mt-1">Your AI-powered study partner. Upload notes, get quizzes & flashcards instantly.</p>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>1. Upload Your Notes</CardTitle>
              <CardDescription>Drag & drop a .txt file or click to select one.</CardDescription>
            </CardHeader>
            <CardContent>
              {!notesContent ? (
                <label
                  htmlFor="file-upload"
                  onDragOver={(e) => handleDragEvent(e, true)}
                  onDragLeave={(e) => handleDragEvent(e, false)}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-accent/50"
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">TXT files only</p>
                  </div>
                  <input id="file-upload" type="file" accept=".txt,text/plain" className="hidden" onChange={handleFileSelect} />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-medium">{fileName}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile} aria-label="Clear file">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => handleGenerate('analysis')} disabled={!notesContent || !!loadingTool} size="lg">
                  {loadingTool === 'analysis' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                  Analyze Notes
                </Button>
                <Button onClick={() => handleGenerate('quiz')} disabled={!notesContent || !!loadingTool} size="lg">
                  {loadingTool === 'quiz' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListChecks className="mr-2 h-4 w-4" />}
                  Generate Quiz
                </Button>
                <Button onClick={() => handleGenerate('flashcards')} disabled={!notesContent || !!loadingTool} size="lg">
                  {loadingTool === 'flashcards' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
                  Generate Flashcards
                </Button>
              </div>
            </CardFooter>
          </Card>

          {loadingTool && <LoadingIndicator tool={loadingTool} />}
          
          {!loadingTool && hasGeneratedContent && (
            <div className="mt-4">
               <h2 className="text-2xl font-bold mb-4">2. Your Study Materials</h2>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analysis" disabled={!analysis}>Key Concepts</TabsTrigger>
                  <TabsTrigger value="quiz" disabled={!quiz}>Quiz</TabsTrigger>
                  <TabsTrigger value="flashcards" disabled={!flashcards}>Flashcards</TabsTrigger>
                </TabsList>
                <TabsContent value="analysis">
                  {analysis && <AnalysisDisplay data={analysis} />}
                </TabsContent>
                <TabsContent value="quiz">
                  {quiz && <QuizDisplay data={quiz} />}
                </TabsContent>
                <TabsContent value="flashcards">
                  {flashcards && <FlashcardDisplay data={flashcards} />}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {!loadingTool && !hasGeneratedContent && (
             <Card className="mt-8 text-center text-muted-foreground py-16">
                <CardContent>
                    <BookOpenCheck className="h-12 w-12 mx-auto mb-4"/>
                    <h3 className="text-lg font-semibold">Your generated content will appear here</h3>
                    <p>Upload your notes and choose an action to get started.</p>
                </CardContent>
             </Card>
          )}

        </div>
      </main>
    </div>
  );
}
