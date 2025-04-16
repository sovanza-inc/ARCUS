import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/db/cloudinary-upload";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canvasProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CanvasData } from "@/types/canvas";
import sharp from 'sharp';
import axios from 'axios';

interface ExclusionZonesResults {
  status: string;
  link_exclusion_Zones_processing: string;
}

async function addRedLineToImage(imageUrl: string): Promise<Buffer> {
  try {
    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Get image dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Calculate line position for top-left corner - smaller and subtle
    const lineY = 30; // Fixed 30px from top
    const lineStartX = 30; // Start 30px from left
    const lineEndX = 80;   // 50px long line

    // Create an SVG with a red line and white background padding
    const svg = `
      <svg width="${width}" height="${height}">
        <rect x="${lineStartX - 5}" y="${lineY - 5}" width="${lineEndX - lineStartX + 10}" height="10" fill="white"/>
        <line x1="${lineStartX}" y1="${lineY}" x2="${lineEndX}" y2="${lineY}" 
              stroke="red" stroke-width="1.5"/>
      </svg>
    `;

    // Composite the line onto the image
    const modifiedImage = await sharp(imageBuffer)
      .composite([{
        input: Buffer.from(svg),
        top: 0,
        left: 0
      }])
      .toBuffer();

    console.log('Red line added to image successfully');
    return modifiedImage;
  } catch (error) {
    console.error('Error adding red line to image:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId, imageUrl, currentPage } = await request.json();
    
    if (!projectId) {
      return new NextResponse("Project ID is required", { status: 400 });
    }

    if (typeof currentPage !== 'number') {
      return new NextResponse("Current page must be a number", { status: 400 });
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      return new NextResponse("Image URL is required and must be a string", { status: 400 });
    }

    // 1. Get the image and add the red line
    const modifiedImageBuffer = await addRedLineToImage(imageUrl);
    
    // 2. Convert Buffer to base64 and upload to Cloudinary
    const base64Image = `data:image/jpeg;base64,${modifiedImageBuffer.toString('base64')}`;
    const modifiedCloudinaryUrl = await uploadToCloudinary(base64Image);
    console.log('Modified image URL with red line:', modifiedCloudinaryUrl);

    // 3. Get the project
    const projects = await db
      .select()
      .from(canvasProjects)
      .where(eq(canvasProjects.id, projectId));

    if (!projects || projects.length === 0) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const project = projects[0];
    const canvasData = project.canvasData as CanvasData;

    // 4. Call the external API for exclusion zones detection
    // Set up AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

    const apiResponse = await fetch('https://arcus.sovanza.org/arcus/exclusion_Zones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image_url: modifiedCloudinaryUrl,
        length: 5
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout); // Clear the timeout

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const detectionResults: ExclusionZonesResults = await apiResponse.json();

    // 5. Update the project with the new canvas data
    const updatedCanvasData: CanvasData = {
      ...canvasData,
      pages: canvasData.pages || [],
      exclusion_Zones_processing: [...(canvasData.exclusion_Zones_processing || [''])]
    };

    // Ensure array has enough slots
    while (updatedCanvasData.exclusion_Zones_processing.length <= currentPage) {
      updatedCanvasData.exclusion_Zones_processing.push('');
    }

    // Store detection URL at the correct index
    updatedCanvasData.exclusion_Zones_processing[currentPage] = detectionResults.link_exclusion_Zones_processing || '';

    await db
      .update(canvasProjects)
      .set({
        canvasData: updatedCanvasData
      })
      .where(eq(canvasProjects.id, projectId));

    // 6. Return the updated project data
    return NextResponse.json({
      success: true,
      modifiedImageUrl: modifiedCloudinaryUrl,
      detectionResults: detectionResults
    });
  } catch (error) {
    console.error("Error in exclusion zones detection:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process image" 
      },
      { status: 500 }
    );
  }
}
