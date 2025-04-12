import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { marked } from "marked";

interface PDFViewerProps {
  content: string;
  title: string;
}

export default function PDFViewer({ content, title }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (content) {
      setIsLoading(false);
    }
  }, [content]);

  const handleDownloadPDF = () => {
    try {
      // Use jsPDF for direct PDF generation (avoiding React-PDF issues)
      import('jspdf').then(({ jsPDF }) => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(22);
        doc.text(title, 20, 20);
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
        
        // Add content with smart pagination
        doc.setFontSize(12);
        const cleanContent = content.replace(/\n#+ /g, '\n\n').replace(/\n/g, '\n\n');
        const splitText = doc.splitTextToSize(cleanContent, 170);
        
        let y = 40;
        splitText.forEach((line: string) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 20, y);
          y += 7;
        });
        
        // Download the PDF
        doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was a problem generating the PDF. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </Button>
          </div>
          
          {/* Content Preview */}
          <div className="prose prose-sm max-w-none dark:prose-invert border rounded-md p-6 h-[450px] overflow-y-auto bg-white dark:bg-gray-900">
            <div dangerouslySetInnerHTML={{ __html: marked(content) }} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
