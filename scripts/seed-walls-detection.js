require('dotenv').config();
const { Client } = require('pg');

// Project IDs to update with wall color processing data
const PROJECTS = [
  {
    id: "0ca56ecd-d017-4cfb-85a1-5f743fddf455",
    data: {
      wall_color_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744425598/uploads/wall_color_processing_1744425604.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744425735/uploads/wall_color_processing_1744425740.jpg"
      ]
    }
  },
  {
    id: "e0827e15-7af6-4500-b321-c6022387d26e",
    data: {
      wall_color_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744425784/uploads/wall_color_processing_1744425790.jpg"
      ]
    }
  },
  {
    id: "1ccde1b4-2c75-473c-94b6-d6b1ee132d27",
    data: {
      wall_color_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744426036/uploads/wall_color_processing_1744425995.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744426174/uploads/wall_color_processing_1744426130.jpg"
      ]
    }
  }
];

async function seedWallsDetectionData() {
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

      // Update the canvas data with the provided wall color processing links
      // Keep the existing data and add the wall_color_processing array
      const updatedCanvasData = {
        ...canvasData,
        ...project.data
      };

      // Update the project with the new canvas data
      await client.query(
        'UPDATE canvas_projects SET canvas_data = $1, updated_at = NOW() WHERE id = $2',
        [updatedCanvasData, project.id]
      );

      console.log(`Successfully updated project ${existingProject.name} with walls detection data`);
    }
  } catch (error) {
    console.error("Error seeding walls detection data:", error);
  } finally {
    await client.end();
    console.log("\nDatabase connection closed");
  }
}

// Run the seed function
seedWallsDetectionData()
  .then(() => {
    console.log("Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
  });
