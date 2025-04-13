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
import { FileText, Download, ArrowLeft, Bot, Copy, Check, FileOutput } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { generateAndDownloadPdf } from '@/lib/pdf-generator';
import { marked } from 'marked';
import { motion } from 'framer-motion';

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
  const [isCopied, setIsCopied] = useState(false);
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

  const downloadAsWord = () => {
    if (reportContent && reportTitle) {
      try {
        // Create Word-compatible HTML content
        const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
  <meta charset="utf-8">
  <title>${reportTitle}</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 20px; }
    p { line-height: 1.5; }
  </style>
</head>
<body>
  <h1>${reportTitle}</h1>
  <p><i>Generated on: ${new Date().toLocaleString()}</i></p>
  <hr>
  ${marked(reportContent)}
  <hr>
  <p><i>Generated by Taskify AI</i></p>
</body>
</html>
        `;
        
        // Create blob for Word document
        const blob = new Blob([htmlContent], {type: 'application/msword'});
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportTitle.replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        toast({
          title: "Word Document Created",
          description: "Your report has been downloaded as a Word document.",
        });
      } catch (err) {
        console.error("Error generating Word document:", err);
        toast({
          title: "Download Failed",
          description: "Failed to generate Word document. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const copyReportContent = () => {
    if (reportContent) {
      navigator.clipboard.writeText(reportContent);
      setIsCopied(true);
      toast({
        title: "Content Copied",
        description: "Report content has been copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 3000); // Reset copy status after 3 seconds
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Report Generator</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Generate and download comprehensive reports
          </p>
        </div>
        <div className="mt-3 sm:mt-4 md:mt-0">
          <Button 
            onClick={() => setLocation('/dashboard')}
            variant="outline"
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {!showReportContent ? (
          <Card>
            <CardHeader className="px-3 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-lg sm:text-xl">Create a New Report</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Ask AI to generate a detailed report on any topic
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(generateReport)} className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Report Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter a title for your report" 
                            className="text-sm sm:text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">What would you like the report to cover?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what you want in your report in detail. For example: Generate a comprehensive report on renewable energy sources."
                            className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  {errorMessage && (
                    <div className="bg-red-900/20 border border-red-900 text-red-100 px-3 py-2 sm:px-4 sm:py-3 rounded-md mb-3 sm:mb-4">
                      <p className="flex items-center text-xs sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errorMessage}
                      </p>
                    </div>
                  )}
                  
                  {isGenerating ? (
                    <div className="border border-primary/20 rounded-lg bg-primary/5 p-3 sm:p-6">
                      <LoadingSpinner 
                        type="sparkles" 
                        size={36} 
                        text="Generating your comprehensive report..." 
                        className="py-8 sm:py-12 text-sm sm:text-base" 
                      />
                      <motion.div 
                        className="w-full bg-primary/10 h-1.5 sm:h-2 mt-4 sm:mt-6 rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ 
                            duration: 15, 
                            ease: "easeInOut" 
                          }}
                        />
                      </motion.div>
                    </div>
                  ) : (
                    <Button 
                      type="submit" 
                      className="w-full text-xs sm:text-sm"
                      size="sm"
                      disabled={isGenerating}
                    >
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> 
                      Generate AI Report
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">{reportTitle}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Generated report content
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportContent(false)}
                  className="mt-2 sm:mt-0 text-xs sm:text-sm"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Create New Report
                </Button>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none px-3 sm:px-6 text-sm sm:text-base prose-headings:text-base sm:prose-headings:text-lg">
                <div
                  dangerouslySetInnerHTML={{ __html: marked(reportContent || '') }}
                />
                
                <div className="flex justify-center mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full">
                    <Card className="border border-gray-800">
                      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 flex flex-col items-center text-center">
                        <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2 sm:mb-3" />
                        <h3 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">PDF Document</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                          Download as formatted PDF
                        </p>
                        <Button 
                          onClick={downloadAsPdf}
                          className="w-full text-xs sm:text-sm"
                          size="sm"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Download PDF
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-gray-800">
                      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 flex flex-col items-center text-center">
                        <FileOutput className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2 sm:mb-3" />
                        <h3 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">Word Document</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                          Download as editable Word
                        </p>
                        <Button 
                          onClick={downloadAsWord}
                          className="w-full text-xs sm:text-sm"
                          size="sm"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Download Word
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-gray-800 sm:col-span-2 md:col-span-1">
                      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 flex flex-col items-center text-center">
                        <Copy className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2 sm:mb-3" />
                        <h3 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">Copy Content</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                          Copy report to clipboard
                        </p>
                        <Button 
                          onClick={copyReportContent}
                          className="w-full text-xs sm:text-sm"
                          size="sm"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Copy Text
                            </>
                          )}
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