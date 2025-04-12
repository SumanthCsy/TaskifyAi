import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { FileText, FileSpreadsheet, Presentation, Download, ArrowLeft, Bot } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { generateAndDownloadPdf } from '@/lib/pdf-generator';
import { marked } from 'marked';

// Form schema for direct AI report generation
const reportFormSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
  title: z.string().min(3, {
    message: 'Title must be at least 3 characters.'
  })
});

export default function Reports() {
  const [_, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [showReportContent, setShowReportContent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      prompt: '',
      title: ''
    },
  });

  const generateReport = async (values: z.infer<typeof reportFormSchema>) => {
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      // Enhanced prompt with structure guidelines
      const enhancedPrompt = `
      Please generate a detailed, well-structured report on the following topic:
      "${values.prompt}"
      
      The report should:
      - Include a clear introduction and conclusion
      - Be organized with meaningful headings and subheadings
      - Provide factual information and insights
      - Use markdown formatting for better readability
      - Be thorough and comprehensive
      `;
      
      // Use the dedicated reports endpoint instead of the general generate endpoint
      // Generate the report using the API
      let reportResponse: any;
      
      try {
        // Try the direct report endpoint first
        reportResponse = await apiRequest('/api/reports/direct', {
          method: 'POST',
          body: JSON.stringify({ 
            prompt: enhancedPrompt,
            title: values.title
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (apiError) {
        console.error('API error details:', apiError);
        // Try using the generate endpoint as fallback
        const fallbackResponse = await apiRequest('/api/generate', {
          method: 'POST',
          body: JSON.stringify({ 
            prompt: enhancedPrompt
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!fallbackResponse || !fallbackResponse.content) {
          throw new Error("The AI service returned an empty response");
        }
        
        // Format the response to match the expected structure
        reportResponse = {
          title: values.title,
          content: fallbackResponse.content,
          createdAt: new Date().toISOString()
        };
      }
      
      if (!reportResponse || !reportResponse.content) {
        throw new Error("The AI service returned an empty response");
      }
      
      setReportTitle(values.title);
      setReportContent(reportResponse.content);
      setShowReportContent(true);
      
      // Show success toast
      toast({
        title: "Report Generated",
        description: "Your report has been successfully generated.",
      });
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      setErrorMessage("Failed to generate the report. Please try again with a different prompt.");
      
      // Show error toast
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsPdf = () => {
    if (reportContent && reportTitle) {
      generateAndDownloadPdf(reportTitle, reportContent);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Report Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate and download comprehensive reports
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setLocation('/dashboard')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {!showReportContent ? (
          <Card>
            <CardHeader>
              <CardTitle>Create a New Report</CardTitle>
              <CardDescription>
                Ask AI to generate a detailed report on any topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(generateReport)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter a title for your report" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What would you like the report to cover?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what you want in your report in detail. For example: Generate a comprehensive report on the history, benefits, and implementation strategies of renewable energy sources, with a focus on solar and wind power."
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {errorMessage && (
                    <div className="bg-red-900/20 border border-red-900 text-red-100 px-4 py-3 rounded-md mb-4">
                      <p className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errorMessage}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size={16} className="mr-2" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Bot className="h-5 w-5 mr-2" /> 
                        Generate AI Report
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{reportTitle}</CardTitle>
                  <CardDescription>
                    Generated report content
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowReportContent(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Create New Report
                </Button>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: marked(reportContent || '') }}
                />
                
                <div className="flex justify-center mt-10 pt-6 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                    <Card>
                      <CardContent className="pt-6 flex flex-col items-center text-center">
                        <FileText className="h-10 w-10 text-primary mb-3" />
                        <h3 className="font-medium text-base mb-2">PDF Document</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Download as formatted PDF
                        </p>
                        <Button 
                          onClick={downloadAsPdf}
                          className="w-full"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" /> Download PDF
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 flex flex-col items-center text-center">
                        <FileSpreadsheet className="h-10 w-10 text-primary mb-3" />
                        <h3 className="font-medium text-base mb-2">Excel Spreadsheet</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Export as Excel file
                        </p>
                        <Button 
                          className="w-full"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" /> Excel
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Presentation className="h-10 w-10 text-primary mb-3" />
                        <h3 className="font-medium text-base mb-2">PowerPoint</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Create presentation slides
                        </p>
                        <Button 
                          className="w-full"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" /> PowerPoint
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}