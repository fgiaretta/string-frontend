import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as globModule from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to convert grid size to percentage
function gridSizeToPercentage(size) {
  const percentages = {
    1: '8.33%',
    2: '16.67%',
    3: '25%',
    4: '33.33%',
    5: '41.67%',
    6: '50%',
    7: '58.33%',
    8: '66.67%',
    9: '75%',
    10: '83.33%',
    11: '91.67%',
    12: '100%',
  };
  return percentages[size] || '100%';
}

// Function to fix Grid components in a file
function fixGridComponentsInFile(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // First, fix any duplicate sx attributes that might have been created
  const duplicateSxRegex = /(sx=\{\{[^}]*\}\})\s+(sx=\{\{[^}]*\}\})/g;
  content = content.replace(duplicateSxRegex, (match, firstSx, secondSx) => {
    modified = true;
    return firstSx; // Keep only the first sx prop
  });

  // Remove xs, sm, md, lg, xl props and component prop
  const gridRegex = /<Grid\s+([^>]*)(component=["']div["'])?([^>]*)(xs=\{(\d+)\})?([^>]*)(sm=\{(\d+)\})?([^>]*)(md=\{(\d+)\})?([^>]*)(lg=\{(\d+)\})?([^>]*)(xl=\{(\d+)\})?([^>]*)>/g;
  
  content = content.replace(gridRegex, (match, before, component, afterComponent, xsProp, xsValue, afterXs, smProp, smValue, afterSm, mdProp, mdValue, afterMd, lgProp, lgValue, afterLg, xlProp, xlValue, afterXl) => {
    modified = true;
    
    // Build the sx prop with responsive width values
    let sxProp = 'sx={{ width: {';
    let hasWidth = false;
    
    if (xsValue) {
      sxProp += ` xs: '${gridSizeToPercentage(xsValue)}'`;
      hasWidth = true;
    }
    
    if (smValue) {
      sxProp += `${hasWidth ? ',' : ''} sm: '${gridSizeToPercentage(smValue)}'`;
      hasWidth = true;
    }
    
    if (mdValue) {
      sxProp += `${hasWidth ? ',' : ''} md: '${gridSizeToPercentage(mdValue)}'`;
      hasWidth = true;
    }
    
    if (lgValue) {
      sxProp += `${hasWidth ? ',' : ''} lg: '${gridSizeToPercentage(lgValue)}'`;
      hasWidth = true;
    }
    
    if (xlValue) {
      sxProp += `${hasWidth ? ',' : ''} xl: '${gridSizeToPercentage(xlValue)}'`;
    }
    
    sxProp += ' } }}';
    
    // Remove component, xs, sm, md, lg, xl props and add sx prop
    let result = '<Grid ';
    
    // Add any props that were before the component prop, excluding item prop
    if (before) {
      result += before.replace(/\s+item\s*/, ' ').trim() + ' ';
    }
    
    // Add any props that were after the component prop but before xs, excluding item prop
    if (afterComponent) {
      result += afterComponent.replace(/\s+item\s*/, ' ').trim() + ' ';
    }
    
    // Add any remaining props, excluding xs, sm, md, lg, xl, and item props
    const remainingProps = [afterXs, afterSm, afterMd, afterLg, afterXl].filter(Boolean)
      .join(' ')
      .replace(/\s+item\s*/, ' ')
      .replace(/xs=\{\d+\}/, '')
      .replace(/sm=\{\d+\}/, '')
      .replace(/md=\{\d+\}/, '')
      .replace(/lg=\{\d+\}/, '')
      .replace(/xl=\{\d+\}/, '')
      .replace(/component=["']div["']/, '')
      .trim();
    
    if (remainingProps) {
      result += remainingProps + ' ';
    }
    
    // Add the sx prop
    result += sxProp + '>';
    
    return result;
  });

  // If the file was modified, write the changes back
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
    return true;
  }
  
  return false;
}

// Find all TSX files in the src directory
async function main() {
  try {
    const files = await globModule.glob('src/**/*.tsx', { cwd: process.cwd() });
    
    let totalFilesModified = 0;
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(process.cwd(), file);
      if (fixGridComponentsInFile(filePath)) {
        totalFilesModified++;
      }
    }
    
    console.log(`\nCompleted! Modified ${totalFilesModified} files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
