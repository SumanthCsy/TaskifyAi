import { jsPDF } from "jspdf";
import { Topic } from "@shared/schema";

// Function to generate PDF content from markdown
export function markdownToPdfSections(markdown: string) {
  const sections = [];
  
  // Split content by headers
  const lines = markdown.split('\n');
  let currentSection = { title: 'Introduction', content: [] };
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      // Main title - skip as we'll use the topic title
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

// Function to generate a PDF from a topic
export function generatePdfFromTopic(topic: Topic, reportContent: string): Blob {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont("helvetica");
  
  // Add title
  doc.setFontSize(24);
  doc.text(topic.title, 20, 20);
  
  // Add category and creation date
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date(topic.createdAt).toLocaleDateString();
  doc.text(`Category: ${topic.category} | Generated on: ${dateStr}`, 20, 30);
  
  // Add description
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Description:", 20, 40);
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(topic.description, 170), 20, 48);
  
  // Parse the markdown content into sections
  const sections = markdownToPdfSections(reportContent);
  
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
  
  // Add tags at the end
  if (topic.tags && topic.tags.length > 0) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Tags:", 20, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(topic.tags.join(", "), 20, y);
  }
  
  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount} | Generated by Taskify AI`, 20, 290);
  }
  
  return doc.output('blob');
}

// Function to download the PDF
export function downloadPdf(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
}
