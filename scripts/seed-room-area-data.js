require('dotenv').config();
const { Pool } = require('pg');

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Project IDs and corresponding image URLs for room area detection
const roomAreaData = [
  {
    projectId: '0ca56ecd-d017-4cfb-85a1-5f743fddf455',
    images: [
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744426925/uploads/room_area_1744426923.jpg',
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744426819/uploads/room_area_1744426817.jpg'
    ]
  },
  {
    projectId: 'e0827e15-7af6-4500-b321-c6022387d26e',
    images: [
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744428959/uploads/room_area_1744428956.jpg'
    ]
  },
  {
    projectId: '1ccde1b4-2c75-473c-94b6-d6b1ee132d27',
    images: [
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744428725/uploads/room_area_1744427820.jpg',
      'https://res.cloudinary.com/dedcqmvrg/image/upload/v1744428594/uploads/room_area_1744427785.jpg'
    ]
  }
];

async function seedRoomAreaData() {
  try {
    console.log('Starting Room Area Detection data seeding...');

    for (const project of roomAreaData) {
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
      
      // Update the room_area_processing array with the provided images
      canvasData.room_area_processing = images;
      
      // Update the project with the new canvas data
      await pool.query(
        'UPDATE canvas_projects SET canvas_data = $1 WHERE id = $2',
        [JSON.stringify(canvasData), projectId]
      );
      
      console.log(`Updated Room Area Detection data for project ${projectId}`);
    }

    console.log('Room Area Detection data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Room Area Detection data:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the seed function
seedRoomAreaData();
