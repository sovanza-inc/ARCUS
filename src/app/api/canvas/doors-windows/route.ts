import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/db/cloudinary-upload";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canvasProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CanvasData } from "@/types/canvas";

interface DetectionResults {
  status: string;
  complete_doors_and_windows: string;
  single_doors: string;
  double_doors: string;
  windows: string;
  single_doors_and_windows: string;
  single_doors_and_double_doors: string;
  double_doors_and_windows: string;
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

    // 1. Validate and convert base64 to Cloudinary URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      return new NextResponse("Image URL is required and must be a string", { status: 400 });
    }

    console.log('Image URL type:', typeof imageUrl);
    console.log('Image URL starts with:', imageUrl.substring(0, Math.min(30, imageUrl.length)) + '...');
    
    let cloudinaryUrl: string;
    try {
      cloudinaryUrl = await uploadToCloudinary(imageUrl);
      console.log('Cloudinary URL after upload:', cloudinaryUrl);
      
      if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string' || !cloudinaryUrl.startsWith('http')) {
        console.error('Invalid Cloudinary URL returned:', cloudinaryUrl);
        return NextResponse.json(
          { success: false, error: 'Failed to get valid Cloudinary URL' },
          { status: 500 }
        );
      }
    } catch (uploadError) {
      console.error('Error during Cloudinary upload:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload image to Cloudinary' },
        { status: 500 }
      );
    }
    
    // 2. Get the project
    const projects = await db
      .select()
      .from(canvasProjects)
      .where(eq(canvasProjects.id, projectId));

    if (!projects || projects.length === 0) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const project = projects[0];
    const canvasData = project.canvasData as CanvasData;

    // 3. Call the external API for detection
    const apiResponse = await fetch('https://arcus.sovanza.org/arcus/arcus_ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: cloudinaryUrl }),
    });

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const detectionResults: DetectionResults = await apiResponse.json();

    // 4. Update the project with the new canvas data
    const updatedCanvasData: CanvasData = {
      ...canvasData,
      // Keep original pages array unchanged
      pages: canvasData.pages || [],
      // Ensure arrays exist
      complete_doors_and_windows: [...(canvasData.complete_doors_and_windows || [])],
      single_doors: [...(canvasData.single_doors || [])],
      double_doors: [...(canvasData.double_doors || [])],
      windows: [...(canvasData.windows || [])],
      single_doors_and_windows: [...(canvasData.single_doors_and_windows || [])],
      single_doors_and_double_doors: [...(canvasData.single_doors_and_double_doors || [])],
      double_doors_and_windows: [...(canvasData.double_doors_and_windows || [])]
    };

    // Ensure arrays have enough slots
    while (updatedCanvasData.complete_doors_and_windows.length <= currentPage) {
      updatedCanvasData.complete_doors_and_windows.push('');
      updatedCanvasData.single_doors.push('');
      updatedCanvasData.double_doors.push('');
      updatedCanvasData.windows.push('');
      updatedCanvasData.single_doors_and_windows.push('');
      updatedCanvasData.single_doors_and_double_doors.push('');
      updatedCanvasData.double_doors_and_windows.push('');
    }

    // Store detection URLs at the correct index
    updatedCanvasData.complete_doors_and_windows[currentPage] = detectionResults.complete_doors_and_windows;
    updatedCanvasData.single_doors[currentPage] = detectionResults.single_doors;
    updatedCanvasData.double_doors[currentPage] = detectionResults.double_doors;
    updatedCanvasData.windows[currentPage] = detectionResults.windows;
    updatedCanvasData.single_doors_and_windows[currentPage] = detectionResults.single_doors_and_windows;
    updatedCanvasData.single_doors_and_double_doors[currentPage] = detectionResults.single_doors_and_double_doors;
    updatedCanvasData.double_doors_and_windows[currentPage] = detectionResults.double_doors_and_windows;

    await db
      .update(canvasProjects)
      .set({
        canvasData: updatedCanvasData
      })
      .where(eq(canvasProjects.id, projectId));

    // 5. Return the updated project data
    return NextResponse.json({
      success: true,
      cloudinaryUrl: cloudinaryUrl,
      detectionResults: detectionResults
    });
  } catch (error) {
    console.error("Error in doors-windows detection:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process image" 
      },
      { status: 500 }
    );
  }
}