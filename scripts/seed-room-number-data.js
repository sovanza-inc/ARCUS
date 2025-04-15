require('dotenv').config();
const { Pool } = require('pg');

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Project IDs and corresponding image URLs for room number detection
const roomNumberData = [
  {
    projectId: '0ca56ecd-d017-4cfb-85a1-5f743fddf455',
    images: [
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744429605/uploads/room_n_1744429602.jpg',
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744429667/uploads/room_n_1744429665.jpg'
    ]
  },
  {
    projectId: 'e0827e15-7af6-4500-b321-c6022387d26e',
    images: []  // No data for this project
  },
  {
    projectId: '1ccde1b4-2c75-473c-94b6-d6b1ee132d27',
    images: [
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744430153/uploads/room_n_1744429215.jpg',
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744430655/uploads/room_n_1744429821.jpg'
    ]
  }
];

async function seedRoomNumberData() {
  try {
    console.log('Starting Room Number Detection data seeding...');

    for (const project of roomNumberData) {
      const { projectId, images } = project;
      
      // Get the current project data
      const result = await pool.query(
        'SELECT * FROM canvas_projects WHERE id = $1',
        [projectId]
      );
      
      if (result.rows.length === 0) {
        console.log(`Project ${projectId} not found, skipping...`);
        continue;
      }
      
      const projectData = result.rows[0];
      const canvasData = projectData.canvas_data;
      
      // Update the room_n_processing array with the provided images
      canvasData.room_n_processing = images;
      
      // Update the project with the new canvas data
      await pool.query(
        'UPDATE canvas_projects SET canvas_data = $1 WHERE id = $2',
        [JSON.stringify(canvasData), projectId]
      );
      
      console.log(`Updated Room Number Detection data for project ${projectId}`);
    }

    console.log('Room Number Detection data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Room Number Detection data:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the seed function
seedRoomNumberData();
