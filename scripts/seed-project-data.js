const { Client } = require('pg');

// Project IDs to update
const PROJECTS = [
  {
    id: "82ec619a-6b98-4051-bd1a-fb8527576034",
    data: {
      complete_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744741395/uploads/complete_doors_and_windows_1744741395.jpg"
      ],
      single_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744741397/uploads/single_doors_1744741395.jpg"
      ],
      double_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744741398/uploads/double_doors_1744741395.jpg"
      ],
      windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744741399/uploads/windows_1744741395.jpg"
      ],
      single_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744741400/uploads/single_doors_and_windows_1744741395.jpg"
      ],
      single_doors_and_double_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744741401/uploads/single_doors_and_double_doors_1744741395.jpg"
      ],
      double_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744741403/uploads/double_doors_and_windows_1744741395.jpg"
      ],
      wall_color_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744742463/uploads/wall_color_processing_1744742462.jpg"
      ],
      room_area_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744742656/uploads/room_area_1744742651.jpg"
      ],
      room_n_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744743089/uploads/room_n_1744743022.jpg"
      ],
      exclusion_Zones_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744744523/uploads/exclusion_Zones_1744744518.jpg"
      ],
      fire_alarm_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744744450/uploads/wall_color_processing_1744744446.jpg"
      ]
    }
  }
];

async function seedProjectData() {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Database URL found, connecting to database...");
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Process each project
    for (const project of PROJECTS) {
      console.log(`\nProcessing project with ID: ${project.id}`);
      
      // Fetch the current project data
      const { rows } = await client.query(
        'SELECT * FROM canvas_projects WHERE id = $1',
        [project.id]
      );

      if (rows.length === 0) {
        console.error(`Project not found with ID: ${project.id}, skipping...`);
        continue;
      }

      const existingProject = rows[0];
      const canvasData = existingProject.canvas_data;

      console.log(`Current project data for ${existingProject.name}:`, {
        pagesCount: canvasData.pages?.length || 0,
        currentPage: canvasData.currentPage
      });

      // Update the canvas data with the provided Cloudinary links
      // Keep the existing pages and other properties
      const updatedCanvasData = {
        ...canvasData,
        ...project.data
      };

      // Update the project with the new canvas data
      await client.query(
        'UPDATE canvas_projects SET canvas_data = $1, updated_at = NOW() WHERE id = $2',
        [updatedCanvasData, project.id]
      );

      console.log(`Successfully updated project: ${project.id}`);
    }

    console.log('\nAll projects updated successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedProjectData();
