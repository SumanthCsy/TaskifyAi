import ExcelJS from 'exceljs';
import { Prompt } from '@shared/schema';

/**
 * Generate an Excel file from a prompt content
 * @param prompt The prompt to convert
 * @returns Buffer containing the generated Excel file
 */
export async function generateExcelFromPrompt(prompt: Prompt): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Add metadata
  workbook.creator = 'AI Information Tool';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Create a worksheet
  const worksheet = workbook.addWorksheet('AI Response');
  
  // Set column width
  worksheet.columns = [
    { header: '', key: 'section', width: 20 },
    { header: '', key: 'content', width: 80 }
  ];
  
  // Add title
  worksheet.addRow(['Title', prompt.title]);
  worksheet.getRow(1).font = { bold: true, size: 14 };
  worksheet.getRow(1).height = 24;
  
  // Add prompt
  worksheet.addRow(['Original Prompt', prompt.prompt]);
  worksheet.getRow(2).font = { italic: true };
  
  // Add date
  const createdDate = new Date(prompt.createdAt);
  worksheet.addRow(['Date Created', createdDate.toLocaleString()]);
  
  // Add spacing
  worksheet.addRow(['', '']);
  
  // Parse content (assuming markdown format)
  const content = prompt.content;
  const lines = content.split('\n');
  
  let currentSection = '';
  let currentContent = '';
  
  for (const line of lines) {
    // Check if line is a heading
    if (line.startsWith('# ')) {
      // If we have accumulated content, add it
      if (currentSection && currentContent) {
        worksheet.addRow([currentSection, currentContent.trim()]);
      }
      
      // Start new section
      currentSection = line.replace('# ', '');
      currentContent = '';
    } else if (line.startsWith('## ')) {
      // If we have accumulated content, add it
      if (currentSection && currentContent) {
        worksheet.addRow([currentSection, currentContent.trim()]);
      }
      
      // Start new section
      currentSection = line.replace('## ', '');
      currentContent = '';
    } else {
      // Add to current content
      currentContent += line + '\n';
    }
  }
  
  // Add final section if exists
  if (currentSection && currentContent) {
    worksheet.addRow([currentSection, currentContent.trim()]);
  }
  
  // Style the content
  for (let i = 4; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    
    // Make section names bold
    if (row.getCell(1).value) {
      row.getCell(1).font = { bold: true };
    }
    
    // Add border to content cells
    row.getCell(2).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  
  // Create a buffer for the xlsx file
  return await workbook.xlsx.writeBuffer();
}

/**
 * Generate an Excel file from a report content
 * @param title The report title
 * @param content The report content
 * @returns Buffer containing the generated Excel file
 */
export async function generateExcelFromReport(title: string, content: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Add metadata
  workbook.creator = 'AI Information Tool';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Create a worksheet
  const worksheet = workbook.addWorksheet('AI Report');
  
  // Set column width
  worksheet.columns = [
    { header: '', key: 'section', width: 20 },
    { header: '', key: 'content', width: 80 }
  ];
  
  // Add title
  worksheet.addRow(['Title', title]);
  worksheet.getRow(1).font = { bold: true, size: 14 };
  worksheet.getRow(1).height = 24;
  
  // Add date
  worksheet.addRow(['Date Generated', new Date().toLocaleString()]);
  
  // Add spacing
  worksheet.addRow(['', '']);
  
  // Parse content (assuming markdown format)
  const lines = content.split('\n');
  
  let currentSection = '';
  let currentContent = '';
  
  for (const line of lines) {
    // Check if line is a heading
    if (line.startsWith('# ')) {
      // If we have accumulated content, add it
      if (currentSection && currentContent) {
        worksheet.addRow([currentSection, currentContent.trim()]);
      }
      
      // Start new section
      currentSection = line.replace('# ', '');
      currentContent = '';
    } else if (line.startsWith('## ')) {
      // If we have accumulated content, add it
      if (currentSection && currentContent) {
        worksheet.addRow([currentSection, currentContent.trim()]);
      }
      
      // Start new section
      currentSection = line.replace('## ', '');
      currentContent = '';
    } else {
      // Add to current content
      currentContent += line + '\n';
    }
  }
  
  // Add final section if exists
  if (currentSection && currentContent) {
    worksheet.addRow([currentSection, currentContent.trim()]);
  }
  
  // Style the content
  for (let i = 3; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    
    // Make section names bold
    if (row.getCell(1).value) {
      row.getCell(1).font = { bold: true };
    }
    
    // Add border to content cells
    row.getCell(2).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  
  // Create a buffer for the xlsx file
  return await workbook.xlsx.writeBuffer();
}