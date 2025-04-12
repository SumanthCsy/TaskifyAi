import { useState } from 'react';
import { useGenerateReport, usePromptReports } from '@/hooks/use-reports';
import { usePromptById } from '@/hooks/use-prompts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Clock, Eye, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { generateAndDownloadPdf } from '@/lib/pdf-generator';
import { Report } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PDFViewer from './pdf-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { marked } from 'marked';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Report title is required.',
  }),
});

interface ReportGeneratorProps {
  promptId: number;
}

export default function ReportGenerator({ promptId }: ReportGeneratorProps) {
  const generateReport = useGenerateReport();
  const { data: reports, isLoading } = usePromptReports(promptId);
  const { data: prompt } = usePromptById(promptId);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pdf');
  const [downloading, setDownloading] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setGeneratingReport(true);
    generateReport.mutate(
      {
        promptId,
        title: values.title,
      },
      {
        onSettled: () => {
          setGeneratingReport(false);
          form.reset();
        },
      }
    );
  }

  // Improved download handler with more robust browser support
  function handleDownload(report: Report, format: 'pdf' | 'word') {
    setDownloading(format);
    
    // Helper function to safely download any file
    const safeDownload = (blob: Blob, filename: string) => {
      try {
        // Create a blob URL
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
        
        // Make link invisible
        downloadLink.style.position = 'absolute';
        downloadLink.style.visibility = 'hidden';
        downloadLink.style.opacity = '0';
        
        // Add to DOM, click, and clean up
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Delay cleanup to ensure browser has time to process
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        return true;
      } catch (err) {
        console.error(`Failed to download file (${format}):`, err);
        return false;
      }
    };
    
    if (format === 'pdf') {
      try {
        // Create PDF document using jsPDF
        import('jspdf').then(({ jsPDF }) => {
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(22);
          doc.text(report.title, 20, 20);
          
          // Add date
          doc.setFontSize(12);
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
          
          // Add content with smart pagination
          doc.setFontSize(12);
          const splitText = doc.splitTextToSize(report.content.replace(/\n#+ /g, '\n\n').replace(/\n/g, '\n\n'), 170);
          let y = 40;
          
          splitText.forEach((line: string) => {
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, 20, y);
            y += 7;
          });
          
          // Get the PDF as blob and download
          const pdfBlob = doc.output('blob');
          const success = safeDownload(pdfBlob, `${report.title.replace(/\s+/g, '_')}.pdf`);
          
          if (!success) {
            // Fallback for PDF: open in new window
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
          }
        }).catch(err => {
          console.error("Failed to load jsPDF:", err);
        }).finally(() => {
          setDownloading(null);
        });
      } catch (err) {
        console.error("PDF generation error:", err);
        setDownloading(null);
      }
    } else if (format === 'word') {
      try {
        // Create a Word document for download
        // First, create a blob with HTML content that Word can parse
        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
          <head>
            <meta charset="utf-8">
            <title>${report.title}</title>
            <style>
              body { font-family: Calibri, Arial, sans-serif; }
              h1 { color: #333; }
              h2 { color: #555; margin-top: 20px; }
              p { line-height: 1.5; }
            </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <p><i>Generated on: ${new Date().toLocaleString()}</i></p>
            <hr>
            ${marked(report.content)}
            <hr>
            <p><i>Generated by Taskify AI</i></p>
          </body>
          </html>
        `;
        
        // Create blob
        const blob = new Blob([htmlContent], {type: 'application/msword'});
        safeDownload(blob, `${report.title.replace(/\s+/g, '_')}.doc`);
        setDownloading(null);
      } catch (err) {
        console.error("Word generation error:", err);
        setDownloading(null);
      }
    }
  }

  function handlePreview(report: Report) {
    setSelectedReport(report);
    setPreviewOpen(true);
    // Pre-select the PDF preview tab when opening
    setActiveTab('pdf');
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a title for your report" {...field} />
                </FormControl>
                <FormDescription>
                  This will be used as the title of your report.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            disabled={generateReport.isPending || generatingReport}
          >
            {generateReport.isPending || generatingReport ? (
              <>Generating Report...</>
            ) : (
              <>Generate Comprehensive Report</>
            )}
          </Button>
        </form>
      </Form>

      {reports && reports.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Previous Reports</h3>
          <Separator className="my-4" />
          <div className="space-y-4">
            {reports.map((report: Report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreview(report)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleDownload(report, 'pdf')}
                      disabled={downloading === 'pdf'}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all hover:shadow-md"
                    >
                      {downloading === 'pdf' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      Download PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(report, 'word')}
                      disabled={downloading === 'word'}
                      className="border-purple-400 text-purple-600 hover:bg-purple-50 font-medium px-4 py-2 rounded-md shadow-sm transition-all hover:shadow-md"
                    >
                      {downloading === 'word' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      Download Word
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="download">Download Options</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pdf" className="mt-4">
                <PDFViewer content={selectedReport.content} title={selectedReport.title} />
              </TabsContent>
              
              <TabsContent value="content" className="mt-4">
                <div className="border rounded-md p-4 h-[500px] overflow-y-auto">
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: marked(selectedReport.content) }} />
                </div>
              </TabsContent>
              
              <TabsContent value="download" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <Card className="border-purple-200 shadow-md">
                    <CardContent className="pt-6 flex flex-col items-center">
                      <div className="bg-purple-100 p-4 rounded-full mb-4">
                        <FileText className="w-16 h-16 text-purple-600" />
                      </div>
                      <h3 className="font-medium text-xl mb-2">PDF Document</h3>
                      <p className="text-sm text-center text-muted-foreground mb-6 max-w-md">
                        Download this report as a professionally formatted PDF document that you can easily save, print, or share with others.
                      </p>
                      <Button 
                        onClick={() => handleDownload(selectedReport, 'pdf')}
                        disabled={downloading === 'pdf'}
                        className="w-3/4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md shadow-sm hover:shadow-md transition-all"
                      >
                        {downloading === 'pdf' ? (
                          <span className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 animate-spin" />
                            Preparing PDF...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Download className="w-5 h-5 mr-2" />
                            Download PDF
                          </span>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-4 italic">
                        Generated by Taskify AI
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-200 shadow-md">
                    <CardContent className="pt-6 flex flex-col items-center">
                      <div className="bg-blue-100 p-4 rounded-full mb-4">
                        <FileText className="w-16 h-16 text-blue-600" />
                      </div>
                      <h3 className="font-medium text-xl mb-2">Word Document</h3>
                      <p className="text-sm text-center text-muted-foreground mb-6 max-w-md">
                        Download this report as a Microsoft Word document that you can easily edit, format, or share with others.
                      </p>
                      <Button 
                        onClick={() => handleDownload(selectedReport, 'word')}
                        disabled={downloading === 'word'}
                        className="w-3/4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md shadow-sm hover:shadow-md transition-all"
                      >
                        {downloading === 'word' ? (
                          <span className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 animate-spin" />
                            Preparing Word Document...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Download className="w-5 h-5 mr-2" />
                            Download Word
                          </span>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-4 italic">
                        Generated by Taskify AI
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}