import pptxgen from 'pptxgenjs';
import { Prompt } from '@shared/schema';

/**
 * Generate a PowerPoint presentation from a prompt content
 * @param prompt The prompt to convert
 * @returns Buffer containing the generated PowerPoint file
 */
export async function generatePptFromPrompt(prompt: Prompt): Promise<Buffer> {
  // Create a new presentation
  const pres = new pptxgen();
  
  // Add metadata
  pres.author = 'AI Information Tool';
  pres.company = 'AI Insights';
  pres.subject = prompt.title;
  pres.title = prompt.title;
  
  // Set default slide options
  pres.layout = 'LAYOUT_WIDE';
  pres.theme = {
    headFontFace: 'Arial',
    bodyFontFace: 'Arial'
  };
  
  // Title slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: 'F5F5F5' };
  
  titleSlide.addText(prompt.title, {
    x: 0.5,
    y: 2.0,
    w: '90%',
    h: 1.5,
    align: 'center',
    fontSize: 44,
    bold: true,
    color: '1565C0'
  });
  
  titleSlide.addText('Generated by AI Information Tool', {
    x: 0.5,
    y: 4.0,
    w: '90%',
    h: 0.5,
    align: 'center',
    fontSize: 20,
    color: '546E7A'
  });
  
  const dateStr = new Date(prompt.createdAt).toLocaleDateString();
  titleSlide.addText(`Created: ${dateStr}`, {
    x: 0.5,
    y: 5.0,
    w: '90%',
    h: 0.5,
    align: 'center',
    fontSize: 14,
    color: '78909C'
  });
  
  // Introduction slide
  const introSlide = pres.addSlide();
  introSlide.addText('Introduction', {
    x: 0.5,
    y: 0.5,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: '1565C0'
  });
  
  introSlide.addText('Original Prompt:', {
    x: 0.5,
    y: 1.5,
    w: '90%',
    h: 0.5,
    fontSize: 16,
    bold: true
  });
  
  introSlide.addText(prompt.prompt, {
    x: 0.5,
    y: 2.0,
    w: '90%',
    h: 1.0,
    fontSize: 16,
    italic: true,
    color: '546E7A'
  });
  
  // Parse content (assuming markdown format)
  const content = prompt.content;
  const lines = content.split('\n');
  
  let currentSection = '';
  let currentContent = '';
  let currentPoints: string[] = [];
  let isList = false;
  
  for (const line of lines) {
    // Skip title which we already used
    if (line.startsWith('# ') && line.substring(2).trim() === prompt.title) {
      continue;
    }
    
    // Check if line is a major heading
    if (line.startsWith('# ')) {
      // Process previous section if exists
      if (currentSection && (currentContent || currentPoints.length > 0)) {
        addContentSlide(pres, currentSection, currentContent, currentPoints);
      }
      
      // Start new section
      currentSection = line.replace('# ', '');
      currentContent = '';
      currentPoints = [];
      isList = false;
    } 
    // Check if line is a sub-heading
    else if (line.startsWith('## ')) {
      // Process previous section if exists
      if (currentSection && (currentContent || currentPoints.length > 0)) {
        addContentSlide(pres, currentSection, currentContent, currentPoints);
      }
      
      // Start new section
      currentSection = line.replace('## ', '');
      currentContent = '';
      currentPoints = [];
      isList = false;
    }
    // Check if line is a list item
    else if (line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/)) {
      // If we were previously building content, add it
      if (!isList && currentContent.trim()) {
        addContentSlide(pres, currentSection, currentContent.trim(), []);
        currentContent = '';
      }
      
      // Add to current list of points
      const pointText = line.trim().replace(/^-\s|\d+\.\s/, '');
      currentPoints.push(pointText);
      isList = true;
    }
    // Regular content
    else if (line.trim() !== '') {
      // If we were previously building a list, add it
      if (isList && currentPoints.length > 0) {
        addContentSlide(pres, currentSection, '', currentPoints);
        currentPoints = [];
      }
      
      // Add to current content
      currentContent += line + '\n';
      isList = false;
    }
  }
  
  // Add final section if exists
  if (currentSection && (currentContent || currentPoints.length > 0)) {
    addContentSlide(pres, currentSection, currentContent, currentPoints);
  }
  
  // Ending slide
  const endingSlide = pres.addSlide();
  endingSlide.background = { color: 'F5F5F5' };
  
  endingSlide.addText('Thank You!', {
    x: 0.5,
    y: 2.0,
    w: '90%',
    h: 1.5,
    align: 'center',
    fontSize: 44,
    bold: true,
    color: '1565C0'
  });
  
  endingSlide.addText('Generated by AI Information Tool', {
    x: 0.5,
    y: 4.0,
    w: '90%',
    h: 0.5,
    align: 'center',
    fontSize: 20,
    color: '546E7A'
  });
  
  // Export to Buffer
  const data = await pres.write({ outputType: 'nodebuffer' }) as any;
  return Buffer.from(data);
}

/**
 * Helper function to add a content slide
 */
function addContentSlide(
  pres: pptxgen, 
  title: string, 
  content: string,
  bulletPoints: string[]
) {
  const slide = pres.addSlide();
  
  // Add title
  slide.addText(title, {
    x: 0.5,
    y: 0.5,
    w: '90%',
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: '1565C0'
  });
  
  // Add content text if exists
  if (content && content.trim() !== '') {
    slide.addText(content.trim(), {
      x: 0.5,
      y: 1.5,
      w: '90%',
      h: 4.5,
      fontSize: 16,
      color: '333333',
      breakLine: true
    });
  }
  
  // Add bullet points if exist
  if (bulletPoints.length > 0) {
    slide.addText(bulletPoints.map(point => ({ text: point, bullet: true })), {
      x: 0.5,
      y: content ? 3.5 : 1.5,
      w: '90%',
      h: 4.5,
      fontSize: 16,
      color: '333333',
      breakLine: true,
      bullet: { type: 'bullet' }
    });
  }
}

/**
 * Generate a PowerPoint presentation from a report content
 * @param title The report title
 * @param content The report content
 * @returns Buffer containing the generated PowerPoint file
 */
export async function generatePptFromReport(title: string, content: string): Promise<Buffer> {
  // Create a new presentation
  const pres = new pptxgen();
  
  // Add metadata
  pres.author = 'AI Information Tool';
  pres.company = 'AI Insights';
  pres.subject = title;
  pres.title = title;
  
  // Set default slide options
  pres.layout = 'LAYOUT_WIDE';
  pres.theme = {
    headFontFace: 'Arial',
    bodyFontFace: 'Arial'
  };
  
  // Title slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: 'F5F5F5' };
  
  titleSlide.addText(title, {
    x: 0.5,
    y: 2.0,
    w: '90%',
    h: 1.5,
    align: 'center',
    fontSize: 44,
    bold: true,
    color: '1565C0'
  });
  
  titleSlide.addText('Generated by AI Information Tool', {
    x: 0.5,
    y: 4.0,
    w: '90%',
    h: 0.5,
    align: 'center',
    fontSize: 20,
    color: '546E7A'
  });
  
  const dateStr = new Date().toLocaleDateString();
  titleSlide.addText(`Created: ${dateStr}`, {
    x: 0.5,
    y: 5.0,
    w: '90%',
    h: 0.5,
    align: 'center',
    fontSize: 14,
    color: '78909C'
  });
  
  // Parse content (assuming markdown format)
  const lines = content.split('\n');
  
  let currentSection = '';
  let currentContent = '';
  let currentPoints: string[] = [];
  let isList = false;
  
  for (const line of lines) {
    // Skip title which we already used
    if (line.startsWith('# ') && line.substring(2).trim() === title) {
      continue;
    }
    
    // Check if line is a major heading
    if (line.startsWith('# ')) {
      // Process previous section if exists
      if (currentSection && (currentContent || currentPoints.length > 0)) {
        addContentSlide(pres, currentSection, currentContent, currentPoints);
      }
      
      // Start new section
      currentSection = line.replace('# ', '');
      currentContent = '';
      currentPoints = [];
      isList = false;
    } 
    // Check if line is a sub-heading
    else if (line.startsWith('## ')) {
      // Process previous section if exists
      if (currentSection && (currentContent || currentPoints.length > 0)) {
        addContentSlide(pres, currentSection, currentContent, currentPoints);
      }
      
      // Start new section
      currentSection = line.replace('## ', '');
      currentContent = '';
      currentPoints = [];
      isList = false;
    }
    // Check if line is a list item
    else if (line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/)) {
      // If we were previously building content, add it
      if (!isList && currentContent.trim()) {
        addContentSlide(pres, currentSection, currentContent.trim(), []);
        currentContent = '';
      }
      
      // Add to current list of points
      const pointText = line.trim().replace(/^-\s|\d+\.\s/, '');
      currentPoints.push(pointText);
      isList = true;
    }
    // Regular content
    else if (line.trim() !== '') {
      // If we were previously building a list, add it
      if (isList && currentPoints.length > 0) {
        addContentSlide(pres, currentSection, '', currentPoints);
        currentPoints = [];
      }
      
      // Add to current content
      currentContent += line + '\n';
      isList = false;
    }
  }
  
  // Add final section if exists
  if (currentSection && (currentContent || currentPoints.length > 0)) {
    addContentSlide(pres, currentSection, currentContent, currentPoints);
  }
  
  // Ending slide
  const endingSlide = pres.addSlide();
  endingSlide.background = { color: 'F5F5F5' };
  
  endingSlide.addText('Thank You!', {
    x: 0.5,
    y: 2.0,
    w: '90%',
    h: 1.5,
    align: 'center',
    fontSize: 44,
    bold: true,
    color: '1565C0'
  });
  
  endingSlide.addText('Generated by AI Information Tool', {
    x: 0.5,
    y: 4.0,
    w: '90%',
    h: 0.5,
    align: 'center',
    fontSize: 20,
    color: '546E7A'
  });
  
  // Export to Buffer
  const data = await pres.write({ outputType: 'nodebuffer' }) as any;
  return Buffer.from(data);
}