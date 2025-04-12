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
  function handleDownload(report: Report, format: 'pdf' | 'excel' | 'ppt') {
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
    } else if (format === 'excel') {
      // Download Excel file with error handling
      fetch(`/api/reports/${report.id}/excel`, { method: 'GET' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Excel download failed with status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          safeDownload(blob, `${report.title.replace(/\s+/g, '_')}.xlsx`);
        })
        .catch(err => {
          console.error("Failed to download Excel:", err);
          alert("Excel download failed. Please try again.");
        })
        .finally(() => {
          setDownloading(null);
        });
    } else if (format === 'ppt') {
      // Download PowerPoint file with error handling
      fetch(`/api/reports/${report.id}/powerpoint`, { method: 'GET' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`PowerPoint download failed with status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          safeDownload(blob, `${report.title.replace(/\s+/g, '_')}.pptx`);
        })
        .catch(err => {
          console.error("Failed to download PowerPoint:", err);
          alert("PowerPoint download failed. Please try again.");
        })
        .finally(() => {
          setDownloading(null);
        });
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
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleDownload(report, 'pdf')}
                      disabled={downloading === 'pdf'}
                    >
                      {downloading === 'pdf' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      PDF
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleDownload(report, 'excel')}
                      disabled={downloading === 'excel'}
                    >
                      {downloading === 'excel' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                      )}
                      Excel
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleDownload(report, 'ppt')}
                      disabled={downloading === 'ppt'}
                    >
                      {downloading === 'ppt' ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Presentation className="w-4 h-4 mr-2" />
                      )}
                      PowerPoint
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <FileText className="w-12 h-12 text-primary mb-4" />
                      <h3 className="font-medium text-lg mb-2">PDF Document</h3>
                      <p className="text-sm text-center text-muted-foreground mb-4">
                        Download a professionally formatted PDF document
                      </p>
                      <Button 
                        onClick={() => handleDownload(selectedReport, 'pdf')}
                        disabled={downloading === 'pdf'}
                        className="w-full"
                      >
                        {downloading === 'pdf' ? 'Downloading...' : 'Download PDF'}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <FileSpreadsheet className="w-12 h-12 text-primary mb-4" />
                      <h3 className="font-medium text-lg mb-2">Excel Spreadsheet</h3>
                      <p className="text-sm text-center text-muted-foreground mb-4">
                        Download data as an Excel spreadsheet
                      </p>
                      <Button 
                        onClick={() => handleDownload(selectedReport, 'excel')}
                        disabled={downloading === 'excel'}
                        className="w-full"
                      >
                        {downloading === 'excel' ? 'Downloading...' : 'Download Excel'}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <Presentation className="w-12 h-12 text-primary mb-4" />
                      <h3 className="font-medium text-lg mb-2">PowerPoint</h3>
                      <p className="text-sm text-center text-muted-foreground mb-4">
                        Download as a PowerPoint presentation
                      </p>
                      <Button 
                        onClick={() => handleDownload(selectedReport, 'ppt')}
                        disabled={downloading === 'ppt'}
                        className="w-full"
                      >
                        {downloading === 'ppt' ? 'Downloading...' : 'Download PPT'}
                      </Button>
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