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

  // Find all Grid components
  const gridComponentRegex = /<Grid[^>]*>/g;
  const gridComponents = content.match(gridComponentRegex) || [];
  
  // Process each Grid component
  for (const originalGrid of gridComponents) {
    // Extract breakpoint props
    const breakpointProps = {};
    ['xs', 'sm', 'md', 'lg', 'xl'].forEach(bp => {
      const regex = new RegExp(`${bp}=\\{(\\d+)\\}`, 'g');
      const match = regex.exec(originalGrid);
      if (match) {
        breakpointProps[bp] = match[1];
      }
    });
    
    // Skip if no breakpoint props found
    if (Object.keys(breakpointProps).length === 0) {
      continue;
    }
    
    // Create new Grid component without breakpoint props and component prop
    let newGrid = '<Grid';
    
    // Add other props (excluding xs, sm, md, lg, xl, component, item)
    const otherProps = originalGrid
      .replace(/<Grid\s+/, '')
      .replace(/>/g, '')
      .replace(/xs=\{\d+\}/g, '')
      .replace(/sm=\{\d+\}/g, '')
      .replace(/md=\{\d+\}/g, '')
      .replace(/lg=\{\d+\}/g, '')
      .replace(/xl=\{\d+\}/g, '')
      .replace(/component=["']div["']/g, '')
      .replace(/\s+item\s*/g, ' ')
      .replace(/sx=\{\{[^}]*\}\}/g, '') // Remove any existing sx prop
      .trim();
    
    if (otherProps) {
      newGrid += ' ' + otherProps;
    }
    
    // Add sx prop with width
    let sxProp = ' sx={{ width: {';
    let first = true;
    
    for (const [bp, value] of Object.entries(breakpointProps)) {
      if (!first) {
        sxProp += ',';
      }
      sxProp += ` ${bp}: '${gridSizeToPercentage(value)}'`;
      first = false;
    }
    
    sxProp += ' } }}';
    newGrid += sxProp + '>';
    
    // Replace in content
    content = content.replace(originalGrid, newGrid);
    modified = true;
  }

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
