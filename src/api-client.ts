export interface SearchResult {
  query: string;
  resultsCount: number;
  results: Array<{
    file: string;
    filePath: string;
    matchCount: number;
    matches: Array<{
      lineNumber: number;
      matchedLine: string;
      snippet: string;
      startLine: number;
      endLine: number;
    }>;
  }>;
}

export interface FilesResult {
  filesCount: number;
  files: string[];
}

const BASE_URL = process.env.BRAIN_API_URL || 'http://localhost:3000/api';

export async function apiSearch(query: string, context: number = 2): Promise<SearchResult> {
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.append('q', query);
  url.searchParams.append('context', String(context));

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json() as { error: string };
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return (await response.json()) as SearchResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to connect to API: ${errorMessage}`);
  }
}

export async function apiListFiles(): Promise<FilesResult> {
  try {
    const response = await fetch(`${BASE_URL}/files`);

    if (!response.ok) {
      const error = await response.json() as { error: string };
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return (await response.json()) as FilesResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to connect to API: ${errorMessage}`);
  }
}

export async function apiHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
