import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/db/cloudinary-upload";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canvasProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CanvasData } from "@/types/canvas";

interface WallColorResults {
  status: string;
  wall_color_link: string;
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

    // 3. Call the external API for wall color detection
    const apiResponse = await fetch('https://8e9c-103-203-45-133.ngrok-free.app/arcus/wall_color', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: cloudinaryUrl }),
    });

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const detectionResults: WallColorResults = await apiResponse.json();

    // 4. Update the project with the new canvas data
    const updatedCanvasData: CanvasData = {
      ...canvasData,
      // Keep original pages array unchanged
      pages: canvasData.pages || [],
      // Ensure wall_color_processing array exists
      wall_color_processing: [...(canvasData.wall_color_processing || [])]
    };

    // Ensure array has enough slots
    while (updatedCanvasData.wall_color_processing.length <= currentPage) {
      updatedCanvasData.wall_color_processing.push('');
    }

    // Initialize array with null if it doesn't exist
    if (!updatedCanvasData.wall_color_processing) {
      updatedCanvasData.wall_color_processing = [];
    }

    // Store detection URL at the correct index
    updatedCanvasData.wall_color_processing[currentPage] = detectionResults.wall_color_link;

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
    console.error("Error in wall color detection:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process image" 
      },
      { status: 500 }
    );
  }
}
