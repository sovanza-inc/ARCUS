import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canvasProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { CanvasData } from "@/types/canvas";

export const maxDuration = 60; // Maximum duration allowed for Vercel hobby plan
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name = "Untitled Project", canvasData = {} } = body;

    // Validate canvasData structure
    if (canvasData.pages && !Array.isArray(canvasData.pages)) {
      return new NextResponse("Invalid canvas data format", { status: 400 });
    }

    // Create default canvas data with all arrays initialized
    const defaultCanvasData: CanvasData = {
      version: "1.0",
      pages: [],
      currentPage: 0,
      complete_doors_and_windows: [],
      single_doors: [],
      double_doors: [],
      windows: [],
      single_doors_and_windows: [],
      single_doors_and_double_doors: [],
      double_doors_and_windows: [],
      wall_color_processing: [], // Added for Walls Detection feature
      room_area_processing: [], // Added for Room Area Detection feature
      room_n_processing: [], // Added for Room Number Detection feature
      exclusion_Zones_processing: [], // Added for Inclusive/Exclusive Zones Detection feature
      fire_alarm_processing: [] // Added for Fire Alarm Detection feature
    };

    // Implement chunking for large files
    // If totalChunks is provided, we're handling a large file in chunks
    const isChunkedUpload = canvasData.totalChunks && canvasData.chunkIndex !== undefined && canvasData.projectId;
    
    // Merge with provided data
    const finalCanvasData: CanvasData = {
      ...defaultCanvasData,
      ...canvasData,
      pages: canvasData.pages || defaultCanvasData.pages,
      currentPage: canvasData.currentPage || defaultCanvasData.currentPage,
      version: canvasData.version || defaultCanvasData.version,
      totalChunks: canvasData.totalChunks,
      chunkIndex: canvasData.chunkIndex,
      projectId: canvasData.projectId,
      complete_doors_and_windows: canvasData.complete_doors_and_windows || defaultCanvasData.complete_doors_and_windows,
      single_doors: canvasData.single_doors || defaultCanvasData.single_doors,
      double_doors: canvasData.double_doors || defaultCanvasData.double_doors,
      windows: canvasData.windows || defaultCanvasData.windows,
      single_doors_and_windows: canvasData.single_doors_and_windows || defaultCanvasData.single_doors_and_windows,
      single_doors_and_double_doors: canvasData.single_doors_and_double_doors || defaultCanvasData.single_doors_and_double_doors,
      double_doors_and_windows: canvasData.double_doors_and_windows || defaultCanvasData.double_doors_and_windows,
      fire_alarm_processing: canvasData.fire_alarm_processing || defaultCanvasData.fire_alarm_processing
    };

    // Create project with validated data
    let canvasProject;
    if (isChunkedUpload) {
      // If this is a chunked upload, we need to find the existing project and update it
      const existingProjects = await db
        .select()
        .from(canvasProjects)
        .where(eq(canvasProjects.id, canvasData.projectId));

      if (!existingProjects || existingProjects.length === 0) {
        return new NextResponse("Project not found", { status: 404 });
      }

      const existingProject = existingProjects[0];
      const existingCanvasData = existingProject.canvasData as CanvasData;
      
      // Merge the new pages with existing pages
      const mergedCanvasData: CanvasData = {
        ...existingCanvasData,
        pages: [
          ...existingCanvasData.pages,
          ...finalCanvasData.pages
        ],
        // Keep track of upload progress
        totalChunks: finalCanvasData.totalChunks,
        chunkIndex: finalCanvasData.chunkIndex,
        // Merge all other arrays
        complete_doors_and_windows: [
          ...existingCanvasData.complete_doors_and_windows,
          ...finalCanvasData.complete_doors_and_windows
        ],
        single_doors: [
          ...existingCanvasData.single_doors,
          ...finalCanvasData.single_doors
        ],
        double_doors: [
          ...existingCanvasData.double_doors,
          ...finalCanvasData.double_doors
        ],
        windows: [
          ...existingCanvasData.windows,
          ...finalCanvasData.windows
        ],
        single_doors_and_windows: [
          ...existingCanvasData.single_doors_and_windows,
          ...finalCanvasData.single_doors_and_windows
        ],
        single_doors_and_double_doors: [
          ...existingCanvasData.single_doors_and_double_doors,
          ...finalCanvasData.single_doors_and_double_doors
        ],
        double_doors_and_windows: [
          ...existingCanvasData.double_doors_and_windows,
          ...finalCanvasData.double_doors_and_windows
        ],
        wall_color_processing: [
          ...(existingCanvasData.wall_color_processing || []),
          ...(finalCanvasData.wall_color_processing || [])
        ],
        room_area_processing: [
          ...(existingCanvasData.room_area_processing || []),
          ...(finalCanvasData.room_area_processing || [])
        ],
        room_n_processing: [
          ...(existingCanvasData.room_n_processing || []),
          ...(finalCanvasData.room_n_processing || [])
        ],
        exclusion_Zones_processing: [
          ...(existingCanvasData.exclusion_Zones_processing || []),
          ...(finalCanvasData.exclusion_Zones_processing || [])
        ],
        fire_alarm_processing: [
          ...(existingCanvasData.fire_alarm_processing || []),
          ...(finalCanvasData.fire_alarm_processing || [])
        ]
      };
      
      // Update the project with merged data
      await db
        .update(canvasProjects)
        .set({ canvasData: mergedCanvasData })
        .where(eq(canvasProjects.id, canvasData.projectId));
      
      // Fetch the updated project
      const updatedProjects = await db
        .select()
        .from(canvasProjects)
        .where(eq(canvasProjects.id, canvasData.projectId));
      
      canvasProject = updatedProjects[0];
    } else {
      // If this is not a chunked upload, we can create a new project
      const insertedProjects = await db
        .insert(canvasProjects)
        .values({
          id: crypto.randomUUID(),
          name,
          userId: session.user.id,
          canvasData: finalCanvasData
        })
        .returning();

      canvasProject = insertedProjects[0];
    }

    return NextResponse.json(canvasProject);
  } catch (error) {
    console.error("Error in canvas-projects POST:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      // Single project retrieval
      const projects = await db
        .select()
        .from(canvasProjects)
        .where(eq(canvasProjects.id, projectId));

      if (!projects || projects.length === 0) {
        return new NextResponse("Project not found", { status: 404 });
      }

      return NextResponse.json(projects[0]);
    } else {
      // List all projects for all users
      const projects = await db
        .select()
        .from(canvasProjects);
      // No filter by userId - show all projects to all users

      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error("Error in canvas-projects GET:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return new NextResponse("Project ID is required", { status: 400 });
    }

    // Verify project ownership
    const project = await db
      .select()
      .from(canvasProjects)
      .where(eq(canvasProjects.id, projectId))
      .limit(1);

    if (!project.length || project[0].userId !== session.user.id) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Delete the project
    await db
      .delete(canvasProjects)
      .where(eq(canvasProjects.id, projectId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CANVAS_PROJECTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
