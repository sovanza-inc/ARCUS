/**
 * Utility for handling chunked uploads to work within Vercel's 60-second function timeout limit
 */

interface ChunkedUploadOptions {
  data: any;
  chunkSize?: number;
  endpoint: string;
  onProgress?: (progress: number) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  headers?: Record<string, string>;
}

interface ChunkData {
  chunkIndex: number;
  totalChunks: number;
  projectId?: string;
  [key: string]: any;
}

/**
 * Handles large data uploads by splitting them into smaller chunks
 * that can be processed within Vercel's 60-second function timeout
 */
export async function uploadInChunks({
  data,
  chunkSize = 500000, // Default chunk size (adjust based on your data)
  endpoint,
  onProgress,
  onComplete,
  onError,
  headers = {}
}: ChunkedUploadOptions) {
  try {
    // Convert data to string if it's an object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Calculate total chunks needed
    const totalChunks = Math.ceil(dataString.length / chunkSize);
    
    // If data is small enough, send in one request
    if (totalChunks === 1) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ canvasData: data })
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      onComplete?.(result);
      return result;
    }
    
    // For larger data, we need to upload in chunks
    let projectId: string | undefined;
    
    // Process each chunk
    for (let i = 0; i < totalChunks; i++) {
      // Extract chunk data
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, dataString.length);
      const chunk = dataString.substring(start, end);
      
      // Prepare chunk data with metadata
      const chunkData: ChunkData = {
        ...JSON.parse(chunk),
        chunkIndex: i,
        totalChunks,
      };
      
      // Add projectId for subsequent chunks
      if (projectId) {
        chunkData.projectId = projectId;
      }
      
      // Upload the chunk
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ 
          canvasData: chunkData,
          name: data.name || "Untitled Project"
        })
      });
      
      if (!response.ok) {
        throw new Error(`Chunk upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Save the projectId from the first chunk for subsequent chunks
      if (i === 0) {
        projectId = result.id;
      }
      
      // Report progress
      onProgress?.((i + 1) / totalChunks * 100);
    }
    
    // Fetch the complete project after all chunks are uploaded
    if (projectId) {
      const response = await fetch(`${endpoint}/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get completed project: ${response.statusText}`);
      }
      
      const result = await response.json();
      onComplete?.(result);
      return result;
    }
  } catch (error) {
    console.error("Chunked upload failed:", error);
    onError?.(error as Error);
    throw error;
  }
}
