import { useState } from 'react';
import { usePromptById } from '@/hooks/use-prompts';
import { useToggleFavorite } from '@/hooks/use-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useLocation } from 'wouter';
import { Bookmark, BookmarkCheck, ArrowLeft, FileText, Trash, Download } from 'lucide-react';
import ReportGenerator from '@/components/report/report-generator';
import { useDeletePrompt } from '@/hooks/use-prompts';
import { marked } from 'marked';
import { generateAndDownloadPdf } from '@/lib/pdf-generator';

interface PromptViewProps {
  id: number;
}

export default function PromptView({ id }: PromptViewProps) {
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const { data: prompt, isLoading, error } = usePromptById(id);
  const toggleFavorite = useToggleFavorite();
  const deletePrompt = useDeletePrompt();
  const [_, setLocation] = useLocation();

  if (isLoading) {
    return <LoadingSpinner size={40} text="Loading prompt data..." />;
  }

  if (error || !prompt) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Prompt</h2>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : "The prompt couldn't be found."}
            </p>
            <Button onClick={() => setLocation('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt.mutate(id);
      setLocation('/');
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleToggleFavorite} 
            title={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {prompt.isFavorite ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowReportGenerator(!showReportGenerator)} 
            title="Generate Report"
            className="flex items-center"
          >
            <FileText className="h-5 w-5 mr-2" />
            {showReportGenerator ? "Hide PDF Generator" : "Generate PDF"}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleDelete} 
            title="Delete Prompt"
          >
            <Trash className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{prompt.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            <div>
              <span className="font-semibold">Prompt:</span> {prompt.prompt}
            </div>
            <div>
              <span className="font-semibold">Created:</span> {new Date(prompt.createdAt).toLocaleString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(prompt.content) }} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => generateAndDownloadPdf(prompt.title, prompt.content)}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReportGenerator && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportGenerator promptId={id} />
          </CardContent>
        </Card>
      )}
    </>
  );
}