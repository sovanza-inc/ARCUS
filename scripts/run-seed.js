const { execSync } = require('child_process');
const path = require('path');

// Run the seed script using tsx
try {
  console.log('Running seed script...');
  execSync('npx tsx ./scripts/seed-doors-windows-data.ts', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  console.log('Seed script completed successfully');
} catch (error) {
  console.error('Error running seed script:', error.message);
  process.exit(1);
}
