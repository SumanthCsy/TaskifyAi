import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useGenerateResponse } from "@/hooks/use-prompts";
import { FileSpreadsheet, Download, ArrowLeft, Send } from "lucide-react";

export default function ExcelSpreadsheet() {
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

  const handleGenerateExcel = () => {
    if (promptId) {
      setIsDownloading(true);
      
      fetch(`/api/excel/generate/${promptId}`)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title || 'excel-data'}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          setIsDownloading(false);
        })
        .catch(error => {
          console.error('Error downloading Excel file:', error);
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
          <FileSpreadsheet className="h-8 w-8 mr-3 text-green-400" />
          Excel Spreadsheet Generator
        </h1>
        
        <Card className="bg-gray-900 border-gray-800 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">Generate Excel Spreadsheet</CardTitle>
            <CardDescription className="text-gray-400">
              Describe the data you need in your spreadsheet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Example: Generate a monthly budget spreadsheet with income and expense categories..." 
              className="min-h-[150px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={generateResponse.isPending || !!promptId}
            />
            
            {promptId && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-green-400 mb-4">
                  ✓ Content generated successfully! Now create your Excel file:
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Spreadsheet Name
                    </label>
                    <Input
                      placeholder="Enter a name for your Excel file"
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
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
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
                onClick={handleGenerateExcel}
                disabled={isDownloading}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isDownloading ? (
                  <>
                    <LoadingSpinner size={16} /> Creating Excel File...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Download Excel (.xlsx)
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Excel Spreadsheet Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-green-600 text-white">1</Badge>
                  <h3 className="font-medium text-white">Organized Data</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Data structured in tables with properly formatted columns and rows
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-green-600 text-white">2</Badge>
                  <h3 className="font-medium text-white">Clear Formatting</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Professional styling with headers, proper data types, and cell formatting
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-green-600 text-white">3</Badge>
                  <h3 className="font-medium text-white">Ready to Use</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Download as .xlsx format compatible with Excel, Google Sheets and more
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}