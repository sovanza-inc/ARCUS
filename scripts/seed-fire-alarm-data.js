require('dotenv').config();
const { Client } = require('pg');

// Project IDs to update
const PROJECTS = [
  {
    id: "0ca56ecd-d017-4cfb-85a1-5f743fddf455",
    data: {
      fire_alarm_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744510916/uploads/wall_color_processing_1744510915.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744510815/uploads/wall_color_processing_1744510816.jpg"
      ]
    }
  },
  {
    id: "1ccde1b4-2c75-473c-94b6-d6b1ee132d27",
    data: {
      fire_alarm_processing: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744512418/uploads/wall_color_processing_1744511754.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744513264/uploads/wall_color_processing_1744512500.jpg"
      ]
    }
  }
];

async function seedFireAlarmData() {
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

      console.log(`Successfully updated project ${existingProject.name} with fire alarm data`);
    }
  } catch (error) {
    console.error("Error seeding fire alarm data:", error);
  } finally {
    await client.end();
    console.log("\nDatabase connection closed");
  }
}

// Run the seed function
seedFireAlarmData()
  .then(() => {
    console.log("Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
  });
