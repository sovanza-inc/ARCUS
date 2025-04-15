require('dotenv').config();
const { Client } = require('pg');

// Project IDs to update
const PROJECTS = [
  {
    id: "0ca56ecd-d017-4cfb-85a1-5f743fddf455",
    data: {
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
    }
  },
  {
    id: "e0827e15-7af6-4500-b321-c6022387d26e",
    data: {
      complete_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423094/uploads/complete_doors_and_windows_1744423095.jpg"
      ],
      single_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423100/uploads/single_doors_1744423095.jpg"
      ],
      double_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423104/uploads/double_doors_1744423095.jpg"
      ],
      windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423108/uploads/windows_1744423095.jpg"
      ],
      single_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423113/uploads/single_doors_and_windows_1744423095.jpg"
      ],
      single_doors_and_double_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423118/uploads/single_doors_and_double_doors_1744423095.jpg"
      ],
      double_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423122/uploads/double_doors_and_windows_1744423095.jpg"
      ]
    }
  },
  {
    id: "1ccde1b4-2c75-473c-94b6-d6b1ee132d27",
    data: {
      complete_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423396/uploads/complete_doors_and_windows_1744423339.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423911/uploads/complete_doors_and_windows_1744423856.jpg"
      ],
      single_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423462/uploads/single_doors_1744423339.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423971/uploads/single_doors_1744423856.jpg"
      ],
      double_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423523/uploads/double_doors_1744423339.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744424027/uploads/double_doors_1744423856.jpg"
      ],
      windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423586/uploads/windows_1744423339.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744424087/uploads/windows_1744423856.jpg"
      ],
      single_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423649/uploads/single_doors_and_windows_1744423339.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744424149/uploads/single_doors_and_windows_1744423856.jpg"
      ],
      single_doors_and_double_doors: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423710/uploads/single_doors_and_double_doors_1744423339.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744424210/uploads/single_doors_and_double_doors_1744423856.jpg"
      ],
      double_doors_and_windows: [
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744423772/uploads/double_doors_and_windows_1744423339.jpg",
        "https://res.cloudinary.com/dedcqmvrg/image/upload/v1744424269/uploads/double_doors_and_windows_1744423856.jpg"
      ]
    }
  }
];

async function seedDoorsWindowsData() {
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

      console.log(`Successfully updated project ${existingProject.name} with doors and windows data`);
    }
  } catch (error) {
    console.error("Error seeding doors and windows data:", error);
  } finally {
    await client.end();
    console.log("\nDatabase connection closed");
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
