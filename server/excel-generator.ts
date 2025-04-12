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
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
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
  workbook.creator = 'Taskify AI';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Create the main worksheet
  const mainWorksheet = workbook.addWorksheet('Overview');
  
  // Add title with styling
  mainWorksheet.mergeCells('A1:E1');
  const titleCell = mainWorksheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, color: { argb: '4040FF' } };
  titleCell.alignment = { horizontal: 'center' };
  mainWorksheet.getRow(1).height = 30;
  
  // Add date with styling
  mainWorksheet.mergeCells('A2:E2');
  const dateCell = mainWorksheet.getCell('A2');
  dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
  dateCell.font = { italic: true, size: 10 };
  dateCell.alignment = { horizontal: 'center' };
  
  // Add a header for the content
  mainWorksheet.mergeCells('A4:E4');
  const headerCell = mainWorksheet.getCell('A4');
  headerCell.value = 'Report Highlights';
  headerCell.font = { bold: true, size: 14 };
  
  // Set column widths for the main worksheet
  mainWorksheet.columns = [
    { width: 20 },
    { width: 40 },
    { width: 20 },
    { width: 20 },
    { width: 20 }
  ];
  
  // Parse content to extract tables and sections
  const lines = content.split('\n');
  let currentRow = 5;
  let inTable = false;
  let tableData: string[][] = [];
  let tableHeaders: string[] = [];
  
  // Check if content contains table data (markdown tables)
  const hasTableData = content.includes('|') && content.includes('---');
  
  // We'll extract section titles for creating separate worksheets
  const sections: { title: string, content: string[] }[] = [];
  let currentSection = { title: 'Introduction', content: [] };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle section headers to create separate worksheets
    if (line.startsWith('# ')) {
      if (currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { 
        title: line.replace(/^# /, '').trim(), 
        content: [] 
      };
    } else if (line.startsWith('## ')) {
      currentSection.content.push(`**${line.replace(/^## /, '').trim()}**`);
    } else {
      // Process table data
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        // Check if we're starting a new table
        if (!inTable) {
          inTable = true;
          // Extract headers from the first row
          tableHeaders = line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0);
        } else if (line.includes('---')) {
          // This is the separator line in markdown tables, skip it
          continue;
        } else {
          // This is a data row
          const rowData = line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0);
            
          tableData.push(rowData);
        }
      } else {
        // If we were in a table but now found something else, add the table to a worksheet
        if (inTable && tableData.length > 0) {
          // Create a data worksheet for this table
          addTableAsWorksheet(workbook, tableHeaders, tableData);
          
          // Reset table tracking
          inTable = false;
          tableData = [];
          tableHeaders = [];
        }
        
        if (line.trim().length > 0) {
          currentSection.content.push(line);
        }
      }
    }
  }
  
  // Add the last table if there is one
  if (inTable && tableData.length > 0) {
    addTableAsWorksheet(workbook, tableHeaders, tableData);
  }
  
  // Add the last section
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }
  
  // Add content to main worksheet
  let mainRow = 6;
  for (const section of sections) {
    // Add section title
    const sectionRow = mainWorksheet.getRow(mainRow++);
    sectionRow.getCell(1).value = section.title;
    sectionRow.getCell(1).font = { bold: true };
    
    // Add a brief summary (first couple of lines)
    const summaryText = section.content.slice(0, 2).join('\n');
    const summaryRow = mainWorksheet.getRow(mainRow++);
    summaryRow.getCell(2).value = summaryText;
    
    // Add some spacing
    mainRow++;
  }
  
  // Create individual worksheets for each section
  for (const section of sections) {
    if (section.title !== 'Introduction' && section.content.length > 0) {
      // Create a worksheet for this section
      const sectionWorksheet = workbook.addWorksheet(section.title.substring(0, 31)); // Excel limits sheet names to 31 chars
      
      // Add section title as header
      sectionWorksheet.mergeCells('A1:D1');
      const sectionTitleCell = sectionWorksheet.getCell('A1');
      sectionTitleCell.value = section.title;
      sectionTitleCell.font = { bold: true, size: 14 };
      sectionTitleCell.alignment = { horizontal: 'center' };
      
      // Add content
      let sectionRow = 3;
      for (const line of section.content) {
        if (line.trim().length > 0) {
          const contentRow = sectionWorksheet.getRow(sectionRow++);
          contentRow.getCell(1).value = line;
        }
      }
      
      // Set column widths
      sectionWorksheet.getColumn(1).width = 100;
    }
  }
  
  // If no tables were found, create a sample data sheet with data extracted from text
  if (!hasTableData) {
    createDataWorksheet(workbook, content);
  }
  
  // Create buffer for the xlsx file
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Adds a table as a separate worksheet
 */
function addTableAsWorksheet(workbook: ExcelJS.Workbook, headers: string[], data: string[][]) {
  // Create worksheet with table name derived from first header
  const firstHeader = headers[0] || 'Data';
  const wsName = `${firstHeader.substring(0, 20)} Table`;
  const worksheet = workbook.addWorksheet(wsName);
  
  // Set column headers
  const columns = headers.map((header, index) => ({
    header,
    key: `col${index}`,
    width: Math.max(header.length + 5, 15)
  }));
  worksheet.columns = columns;
  
  // Add data rows
  for (const row of data) {
    const rowData: { [key: string]: string } = {};
    row.forEach((cell, index) => {
      if (index < headers.length) {
        rowData[`col${index}`] = cell;
      }
    });
    worksheet.addRow(rowData);
  }
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4040FF' }
  };
  worksheet.getRow(1).alignment = { horizontal: 'center' };
  
  // Add autofilter to header row
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length }
  };
  
  // Add borders and alternating row colors
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    
    // Add light shading to alternate rows
    if (i % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0F0F0' }
      };
    }
    
    // Add border to cells
    for (let j = 1; j <= headers.length; j++) {
      const cell = row.getCell(j);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }
}

/**
 * Creates a data worksheet from text content
 * Attempts to extract data points and create a structured representation
 */
function createDataWorksheet(workbook: ExcelJS.Workbook, content: string) {
  const worksheet = workbook.addWorksheet('Extracted Data');
  
  // Set headers for key findings
  worksheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Key Points', key: 'keypoint', width: 60 },
    { header: 'Priority', key: 'priority', width: 15 }
  ];
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4040FF' }
  };
  
  // Extract key points from each section using bullet points and numbered lists
  const lines = content.split('\n');
  let currentCategory = 'General';
  let rowCount = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for section headers to use as categories
    if (line.startsWith('# ')) {
      currentCategory = line.replace(/^# /, '').trim();
    } else if (line.startsWith('## ')) {
      currentCategory = line.replace(/^## /, '').trim();
    } 
    // Extract bullet points and numbered items
    else if (line.match(/^\s*[\*\-\•]\s+/) || line.match(/^\s*\d+\.\s+/)) {
      // Remove bullet or number prefix
      const keyPoint = line.replace(/^\s*[\*\-\•]\s+/, '').replace(/^\s*\d+\.\s+/, '');
      
      // Assign priority based on position or keywords
      let priority = 'Medium';
      if (keyPoint.toLowerCase().includes('important') || 
          keyPoint.toLowerCase().includes('critical') || 
          keyPoint.toLowerCase().includes('essential')) {
        priority = 'High';
      } else if (keyPoint.toLowerCase().includes('consider') || 
                keyPoint.toLowerCase().includes('optional') || 
                keyPoint.toLowerCase().includes('may')) {
        priority = 'Low';
      }
      
      // Add data row
      worksheet.addRow({
        category: currentCategory,
        keypoint: keyPoint,
        priority: priority
      });
      
      rowCount++;
    }
  }
  
  // If no bullet points were found, extract sentences as data points
  if (rowCount === 1) {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    let counter = 0;
    
    for (const sentence of sentences) {
      if (sentence.trim().length > 10 && counter < 15) { // Limit to 15 data points
        counter++;
        
        // Add data row - alternate between categories
        worksheet.addRow({
          category: counter % 3 === 0 ? 'Insight' : (counter % 3 === 1 ? 'Finding' : 'Observation'),
          keypoint: sentence.trim(),
          priority: counter <= 5 ? 'High' : (counter <= 10 ? 'Medium' : 'Low')
        });
      }
    }
  }
  
  // Add data validation for priority column
  worksheet.getColumn('priority').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber > 1) {
      // Set data validation for priority
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"High,Medium,Low"']
      };
      
      // Color-code priority
      if (cell.value === 'High') {
        cell.font = { color: { argb: 'FF0000' } };
      } else if (cell.value === 'Medium') {
        cell.font = { color: { argb: 'FFA500' } };
      } else if (cell.value === 'Low') {
        cell.font = { color: { argb: '008000' } };
      }
    }
  });
  
  // Set up auto filter and freeze panes
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 3 }
  };
  
  worksheet.views = [
    { state: 'frozen', ySplit: 1, activeCell: 'A2' }
  ];
}