import { useEffect, useState } from "react";
import { Document, Page, Text, View, StyleSheet, PDFViewer as ReactPDFViewer } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface PDFViewerProps {
  content: string;
  title: string;
}

// Create styles for PDF content
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  header: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    fontSize: 10,
    textAlign: 'center',
  },
});

const formatMarkdownToPDFContent = (content: string) => {
  const sections = content.split('\n## ');
  
  // Process the first section (which might contain the title)
  const firstSection = sections.shift() || '';
  const titleMatch = firstSection.match(/^# (.*?)(\n|$)/);
  const title = titleMatch ? titleMatch[1] : '';
  const introduction = titleMatch ? firstSection.replace(/^# (.*?)(\n|$)/, '') : firstSection;
  
  // Process remaining sections
  const processedSections = sections.map(section => {
    const lines = section.split('\n');
    const sectionTitle = lines.shift() || '';
    const sectionContent = lines.join('\n');
    return { title: sectionTitle, content: sectionContent };
  });
  
  return {
    title,
    introduction,
    sections: processedSections
  };
};

export default function PDFViewer({ content, title }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [formattedContent, setFormattedContent] = useState<any>(null);
  
  useEffect(() => {
    if (content) {
      setFormattedContent(formatMarkdownToPDFContent(content));
      setIsLoading(false);
    }
  }, [content]);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);
  };

  const goToNextPage = () => {
    setPageNumber(pageNumber + 1 >= numPages! ? numPages! : pageNumber + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Create PDF Document
  const MyDocument = () => (
    <Document title={title} onRender={() => console.log("PDF rendered")}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.section}>
          <Text style={styles.text}>{formattedContent.introduction}</Text>
        </View>
        
        {formattedContent.sections.map((section: any, index: number) => (
          <View key={index} style={styles.section}>
            <Text style={styles.header}>{section.title}</Text>
            <Text style={styles.text}>{section.content}</Text>
          </View>
        ))}
        
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border overflow-hidden">
        <div style={{ height: '500px' }}>
          <ReactPDFViewer width="100%" height="100%" showToolbar={false}>
            <MyDocument />
          </ReactPDFViewer>
        </div>
        
        {numPages && (
          <div className="flex justify-between items-center p-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            
            <p className="text-sm">
              Page {pageNumber} of {numPages}
            </p>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
