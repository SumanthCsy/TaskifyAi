import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Download, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Topic } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import PDFViewer from "./pdf-viewer";
import { motion } from "framer-motion";

interface ReportGeneratorProps {
  topic: Topic;
}

export default function ReportGenerator({ topic }: ReportGeneratorProps) {
  const [reportContent, setReportContent] = useState<string | null>(null);
  const { toast } = useToast();

  const generateReport = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reports", {
        topicId: topic.id,
        title: `${topic.title} - Report`,
        format: "pdf"
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setReportContent(data.content);
      toast({
        title: "Report Generated",
        description: "Your PDF report has been successfully generated.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      console.error("Failed to generate report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/20">
          <CardTitle className="flex items-center">
            <FileText className="mr-2 text-primary" size={20} />
            Generate PDF Report
          </CardTitle>
          <CardDescription>
            Create a comprehensive, downloadable PDF report about this topic
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {!reportContent ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <FileText size={48} className="mx-auto mb-4 text-primary/50" />
                <h3 className="text-lg font-medium mb-2">Ready to Generate Report</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Our AI will create a detailed report about "{topic.title}" that you can download as a PDF.
                </p>
              </motion.div>
              
              <Button
                onClick={() => generateReport.mutate()}
                disabled={generateReport.isPending}
                className="w-full"
              >
                {generateReport.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate PDF Report
                  </>
                )}
              </Button>
            </div>
          ) : (
            <PDFViewer content={reportContent} title={`${topic.title} - Report`} />
          )}
        </CardContent>
        
        {reportContent && (
          <CardFooter className="border-t bg-card flex justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Check size={16} className="mr-1 text-green-500" />
              Report successfully generated
            </div>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-1" />
              Download PDF
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
