import fs from 'fs';
import path from 'path';

// Default to .knowledge folder only (relative to project root)
const DEFAULT_BASE_DIR = path.join(process.cwd(), '.knowledge');

export interface Match {
  lineNumber: number;
  matchedLine: string;
  snippet: string;
  startLine: number;
  endLine: number;
}

export interface FileResult {
  file: string;
  filePath: string;
  matchCount: number;
  matches: Match[];
}

/**
 * Find all markdown files in the knowledge base directory
 * @param {string} baseDir - Base directory to search from
 * @returns {string[]} Array of markdown file paths
 */
export function findMarkdownFiles(baseDir: string = DEFAULT_BASE_DIR): string[] {
  const mdFiles: string[] = [];

  function walkDir(dir: string): void {
    try {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Skip node_modules, .git, and hidden directories
          if (!file.startsWith('.') && file !== 'node_modules') {
            walkDir(filePath);
          }
        } else if (stat.isFile() && file.endsWith('.md')) {
          mdFiles.push(filePath);
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error reading directory ${dir}:`, errorMessage);
    }
  }

  walkDir(baseDir);
  return mdFiles;
}

/**
 * Search for a query string in markdown files
 * @param {string} query - Search query
 * @param {string} baseDir - Base directory to search from
 * @param {number} contextLines - Number of lines to show as context
 * @returns {FileResult[]} Array of search results with file info and snippets
 */
export function searchMarkdown(
  query: string,
  baseDir: string = DEFAULT_BASE_DIR,
  contextLines: number = 2
): FileResult[] {
  const mdFiles = findMarkdownFiles(baseDir);
  const results: FileResult[] = [];
  const queryRegex = new RegExp(query, 'gi');

  mdFiles.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const matches: Match[] = [];

      lines.forEach((line, lineIndex) => {
        if (queryRegex.test(line)) {
          // Calculate context range
          const startLine = Math.max(0, lineIndex - contextLines);
          const endLine = Math.min(lines.length - 1, lineIndex + contextLines);

          matches.push({
            lineNumber: lineIndex + 1,
            matchedLine: line,
            snippet: lines.slice(startLine, endLine + 1).join('\n'),
            startLine: startLine + 1,
            endLine: endLine + 1,
          });
        }
      });

      if (matches.length > 0) {
        const relativePath = path.relative(baseDir, filePath);
        results.push({
          file: relativePath,
          filePath,
          matchCount: matches.length,
          matches,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error reading file ${filePath}:`, errorMessage);
    }
  });

  return results;
}

