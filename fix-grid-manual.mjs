import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as globModule from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to fix Grid components in a file
function fixGridComponentsInFile(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix duplicate sx props
  content = content.replace(/sx=\{\{[^}]*\}\}\s+sx=\{\{[^}]*\}\}/g, (match) => {
    // Keep only the first sx prop
    return match.split(' sx=')[0];
  });
  
  // Write the changes back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
  return true;
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
