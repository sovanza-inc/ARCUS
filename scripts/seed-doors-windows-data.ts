import { db } from "@/lib/db";
import { canvasProjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CanvasData } from "@/types/canvas";

const PROJECT_ID = "0ca56ecd-d017-4cfb-85a1-5f743fddf455";

async function seedDoorsWindowsData() {
  try {
    console.log("Starting to seed doors and windows data for project:", PROJECT_ID);

    // First, fetch the current project data
    const existingProjects = await db
      .select()
      .from(canvasProjects)
      .where(eq(canvasProjects.id, PROJECT_ID));

    if (existingProjects.length === 0) {
      console.error("Project not found with ID:", PROJECT_ID);
      return;
    }

    const project = existingProjects[0];
    const canvasData = project.canvasData as CanvasData;

    console.log("Current project data:", {
      name: project.name,
      pagesCount: canvasData.pages.length,
      currentPage: canvasData.currentPage
    });

    // Update the canvas data with the provided Cloudinary links
    const updatedCanvasData: CanvasData = {
      ...canvasData,
      complete_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422331/uploads/complete_doors_and_windows_1744422328.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422978/uploads/complete_doors_and_windows_1744422979.jpg"
      ],
      single_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422338/uploads/single_doors_1744422328.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422982/uploads/single_doors_1744422979.jpg"
      ],
      double_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422344/uploads/double_doors_1744422328.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422986/uploads/double_doors_1744422979.jpg"
      ],
      windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422350/uploads/windows_1744422328.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422991/uploads/windows_1744422979.jpg"
      ],
      single_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422356/uploads/single_doors_and_windows_1744422328.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422997/uploads/single_doors_and_windows_1744422979.jpg"
      ],
      single_doors_and_double_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422361/uploads/single_doors_and_double_doors_1744422328.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423002/uploads/single_doors_and_double_doors_1744422979.jpg"
      ],
      double_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744422367/uploads/double_doors_and_windows_1744422328.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423006/uploads/double_doors_and_windows_1744422979.jpg"
      ]
    };

    // Update the project with the new canvas data
    await db
      .update(canvasProjects)
      .set({
        canvasData: updatedCanvasData,
        updatedAt: new Date()
      })
      .where(eq(canvasProjects.id, PROJECT_ID));

    console.log("Successfully updated project with doors and windows data");
  } catch (error) {
    console.error("Error seeding doors and windows data:", error);
  }
}

// Run the seed function
seedDoorsWindowsData()
  .then(() => {
    console.log("Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
  });
