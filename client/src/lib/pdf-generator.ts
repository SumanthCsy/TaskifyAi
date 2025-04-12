import { jsPDF } from "jspdf";
import { Prompt, Report } from "@shared/schema";

interface Section {
  title: string;
  content: string[];
}

// Function to generate PDF content from markdown
export function markdownToPdfSections(markdown: string): Section[] {
  const sections: Section[] = [];
  
  // Split content by headers
  const lines = markdown.split('\n');
  let currentSection: Section = { title: 'Introduction', content: [] };
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      // Main title - skip as we'll use the report title
      continue;
    } else if (line.startsWith('## ')) {
      // Save current section if it has content
      if (currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }
      
      // Start new section
      currentSection = {
        title: line.substring(3),
        content: []
      };
    } else {
      // Add to current section content
      currentSection.content.push(line);
    }
  }
  
  // Add the last section
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Function to generate a PDF from a prompt and report content
export function generatePdfFromReport(report: Report, prompt: Prompt): Blob {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont("helvetica");
  
  // Add title
  doc.setFontSize(24);
  doc.text(report.title, 20, 20);
  
  // Add creation date
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date(report.createdAt).toLocaleDateString();
  doc.text(`Generated on: ${dateStr}`, 20, 30);
  
  // Add original prompt
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Original Prompt:", 20, 40);
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(prompt.prompt, 170), 20, 48);
  
  // Parse the markdown content into sections
  const sections = markdownToPdfSections(report.content);
  
  let y = 65;
  
  // Add each section
  for (const section of sections) {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    // Add section title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(section.title, 20, y);
    y += 8;
    
    // Add section content
    doc.setFontSize(10);
    const contentText = section.content.join('\n');
    const splitText = doc.splitTextToSize(contentText, 170);
    
    // Check if content will overflow page and add new page if needed
    if (y + (splitText.length * 5) > 280) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(splitText, 20, y);
    y += (splitText.length * 5) + 10;
  }
  
  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount} | Built with ❤️ by @Sumanth Csy`, 20, 290);
  }
  
  return doc.output('blob');
}

// Function to create and download a PDF directly from report content
export function generateAndDownloadPdf(title: string, content: string): void {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont("helvetica");
  
  // Add title
  doc.setFontSize(24);
  doc.text(title, 20, 20);
  
  // Add creation date
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString();
  doc.text(`Generated on: ${dateStr}`, 20, 30);
  
  // Parse the markdown content into sections
  const sections = markdownToPdfSections(content);
  
  let y = 45;
  
  // Add each section
  for (const section of sections) {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    // Add section title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(section.title, 20, y);
    y += 8;
    
    // Add section content
    doc.setFontSize(10);
    const contentText = section.content.join('\n');
    const splitText = doc.splitTextToSize(contentText, 170);
    
    // Check if content will overflow page and add new page if needed
    if (y + (splitText.length * 5) > 280) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(splitText, 20, y);
    y += (splitText.length * 5) + 10;
  }
  
  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount} | Built with ❤️ by @Sumanth Csy`, 20, 290);
  }
  
  // Download the PDF
  const blob = doc.output('blob');
  downloadPdf(blob, title.replace(/\s+/g, '_'));
}

// Function to download the PDF with fallback options
export function downloadPdf(blob: Blob, filename: string) {
  try {
    // Ensure filename has .pdf extension
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    
    // Primary method: Use the download attribute
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = safeFilename;
    
    // Hide the link
    link.style.position = 'absolute';
    link.style.visibility = 'hidden';
    link.style.opacity = '0';
    
    // Add to DOM, click, then remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up after delay
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Error during PDF download:", error);
    
    // Fallback method: Open in new window
    try {
      const fallbackUrl = URL.createObjectURL(blob);
      window.open(fallbackUrl, '_blank');
      
      // Show user a message about manual save
      alert("Please use your browser's save function (Ctrl+S or Command+S) to save the PDF.");
      
      // Clean up URL after delay
      setTimeout(() => URL.revokeObjectURL(fallbackUrl), 60000);
    } catch (fallbackError) {
      console.error("PDF fallback method also failed:", fallbackError);
      alert("Could not generate PDF. Please try again or use a different browser.");
    }
  }
}
