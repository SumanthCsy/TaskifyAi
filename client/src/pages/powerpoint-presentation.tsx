import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useGenerateResponse } from "@/hooks/use-prompts";
import { Presentation, Download, ArrowLeft, Send } from "lucide-react";

export default function PowerPointPresentation() {
  const [_, setLocation] = useLocation();
  const [promptInput, setPromptInput] = useState("");
  const [title, setTitle] = useState("");
  const generateResponse = useGenerateResponse();
  const [promptId, setPromptId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSubmitPrompt = () => {
    if (promptInput.trim()) {
      generateResponse.mutate(promptInput, {
        onSuccess: (data) => {
          setPromptId(data.id);
        }
      });
    }
  };

  const handleGeneratePowerPoint = () => {
    if (promptId) {
      setIsDownloading(true);
      
      fetch(`/api/ppt/generate/${promptId}`)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title || 'presentation'}.pptx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          setIsDownloading(false);
        })
        .catch(error => {
          console.error('Error downloading PowerPoint file:', error);
          setIsDownloading(false);
        });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitPrompt();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-2 sm:px-4 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/dashboard")}
          className="mb-4 sm:mb-6 hover:bg-gray-800 text-sm sm:text-base"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" /> Back to Dashboard
        </Button>
        
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center">
          <Presentation className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-blue-400" />
          PowerPoint Presentation Generator
        </h1>
        
        <Card className="bg-gray-900 border-gray-800 shadow-xl mb-6 sm:mb-8">
          <CardHeader className="px-3 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-lg sm:text-xl text-white">Generate PowerPoint Presentation</CardTitle>
            <CardDescription className="text-gray-400 text-xs sm:text-sm">
              Describe the presentation you want to create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-4">
            <Textarea 
              placeholder="Example: Create a presentation about artificial intelligence with 5 slides including an introduction, key concepts, applications, challenges, and future trends..." 
              className="min-h-[120px] sm:min-h-[150px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm sm:text-base"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={generateResponse.isPending || !!promptId}
            />
            
            {promptId && (
              <div className="pt-3 sm:pt-4 border-t border-gray-800">
                <p className="text-xs sm:text-sm text-green-400 mb-3 sm:mb-4">
                  ✓ Content generated successfully! Now create your PowerPoint presentation:
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1">
                      Presentation Title
                    </label>
                    <Input
                      placeholder="Enter a title for your presentation"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-gray-800 pt-3 sm:pt-4 px-3 sm:px-6 pb-3 sm:pb-4">
            {!promptId ? (
              <Button
                onClick={handleSubmitPrompt}
                disabled={!promptInput.trim() || generateResponse.isPending}
                className="gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                size="sm"
              >
                {generateResponse.isPending ? (
                  <>
                    <LoadingSpinner size={16} /> Generating Content...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" /> Generate Content
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleGeneratePowerPoint}
                disabled={isDownloading}
                className="gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm w-full sm:w-auto"
                size="sm"
              >
                {isDownloading ? (
                  <>
                    <LoadingSpinner size={16} /> Creating Presentation...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" /> Download PowerPoint
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">PowerPoint Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Badge className="bg-blue-600 text-white text-xs">1</Badge>
                  <h3 className="font-medium text-white text-sm sm:text-base">Professional Slides</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  Clean slide design with title and content slides in a professional layout
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Badge className="bg-blue-600 text-white text-xs">2</Badge>
                  <h3 className="font-medium text-white text-sm sm:text-base">Structured Content</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  Well-organized content with clear bullet points, headings, and sections
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <Badge className="bg-blue-600 text-white text-xs">3</Badge>
                  <h3 className="font-medium text-white text-sm sm:text-base">Ready for Presentation</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  Download as .pptx format compatible with Microsoft PowerPoint and other presentation software
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}