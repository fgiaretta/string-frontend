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

  // First, completely replace Grid components with proper syntax
  const gridRegex = /<Grid\s+([^>]*)>/g;
  
  content = content.replace(gridRegex, (match, props) => {
    // Extract all props
    const propMatches = {};
    let otherProps = props;
    
    // Extract xs, sm, md, lg, xl props
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
    breakpoints.forEach(bp => {
      const regex = new RegExp(`${bp}=\\{(\\d+)\\}`, 'g');
      const match = regex.exec(otherProps);
      if (match) {
        propMatches[bp] = match[1];
        otherProps = otherProps.replace(match[0], '');
      }
    });
    
    // Remove component prop
    otherProps = otherProps.replace(/component=["']div["']/g, '');
    
    // Remove item prop
    otherProps = otherProps.replace(/item/g, '');
    
    // Remove any existing sx prop to avoid duplicates
    const sxRegex = /sx=\{\{[^}]*\}\}/g;
    otherProps = otherProps.replace(sxRegex, '');
    
    // Build the new sx prop with responsive width values
    let sxProp = '';
    if (Object.keys(propMatches).length > 0) {
      sxProp = 'sx={{ width: {';
      let hasWidth = false;
      
      breakpoints.forEach(bp => {
        if (propMatches[bp]) {
          sxProp += `${hasWidth ? ', ' : ''} ${bp}: '${gridSizeToPercentage(propMatches[bp])}'`;
          hasWidth = true;
        }
      });
      
      sxProp += ' } }}';
    }
    
    // Clean up any extra spaces
    otherProps = otherProps.replace(/\s+/g, ' ').trim();
    
    // Construct the new Grid component
    let result = '<Grid';
    if (otherProps) {
      result += ' ' + otherProps;
    }
    if (sxProp) {
      result += ' ' + sxProp;
    }
    result += '>';
    
    modified = true;
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
