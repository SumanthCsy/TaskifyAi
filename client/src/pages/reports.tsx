import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
    try {
      // Send request to generate AI content
      const response = await apiRequest('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          prompt: values.prompt
        }),
      });
      
      setReportTitle(values.title);
      setReportContent(response.content);
      setShowReportContent(true);
    } catch (error) {
      console.error('Failed to generate report:', error);
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