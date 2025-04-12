import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useGenerateResponse } from "@/hooks/use-prompts";
import { useGenerateReport } from "@/hooks/use-reports";
import { FileText, Download, ArrowLeft, Send } from "lucide-react";

export default function PDFAssignment() {
  const [_, setLocation] = useLocation();
  const [promptInput, setPromptInput] = useState("");
  const [title, setTitle] = useState("");
  const generateResponse = useGenerateResponse();
  const generateReport = useGenerateReport();
  const [promptId, setPromptId] = useState<number | null>(null);

  const handleSubmitPrompt = () => {
    if (promptInput.trim()) {
      generateResponse.mutate(promptInput, {
        onSuccess: (data) => {
          setPromptId(data.id);
        }
      });
    }
  };

  const handleGeneratePDF = () => {
    if (promptId && title.trim()) {
      generateReport.mutate(
        { promptId, title },
        {
          onSuccess: () => {
            // PDF generation successful
          },
        }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitPrompt();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/dashboard")}
          className="mb-6 hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <FileText className="h-8 w-8 mr-3 text-purple-400" />
          PDF Assignment Generator
        </h1>
        
        <Card className="bg-gray-900 border-gray-800 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">Generate PDF Assignment</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your topic or requirements below to generate a detailed PDF report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Example: Write a comprehensive report on renewable energy sources and their environmental impact..." 
              className="min-h-[150px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={generateResponse.isPending || !!promptId}
            />
            
            {promptId && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-green-400 mb-4">
                  ✓ Content generated successfully! Now create your PDF report:
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Report Title
                    </label>
                    <Input
                      placeholder="Enter a title for your PDF report"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
            {!promptId ? (
              <Button
                onClick={handleSubmitPrompt}
                disabled={!promptInput.trim() || generateResponse.isPending}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {generateResponse.isPending ? (
                  <>
                    <LoadingSpinner size={16} /> Generating Content...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Generate Content
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleGeneratePDF}
                disabled={!title.trim() || generateReport.isPending}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {generateReport.isPending ? (
                  <>
                    <LoadingSpinner size={16} /> Creating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Create & Download PDF
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">PDF Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-purple-600 text-white">1</Badge>
                  <h3 className="font-medium text-white">Professional Formatting</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Clean, organized layout with proper headings, paragraphs, and spacing
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-purple-600 text-white">2</Badge>
                  <h3 className="font-medium text-white">Structured Content</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Content organized into logical sections with introduction and conclusion
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-purple-600 text-white">3</Badge>
                  <h3 className="font-medium text-white">Easy Download</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Download your report as a PDF file ready to share or print
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}