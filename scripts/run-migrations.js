const contentful = require('contentful-management');
const fs = require('fs');
const path = require('path');

async function run() {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!token) {
    console.error('Missing CONTENTFUL_MANAGEMENT_TOKEN in environment');
    process.exit(1);
  }

  const client = contentful.createClient({ accessToken: token });
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  const env = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

  const migrationsDir = path.join(__dirname, '..', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('No migrations directory found at', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.js')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    // Migration files are discovered at runtime rather than imported statically.
    const migration = require(filePath);
    if (migration && typeof migration.up === 'function') {
      console.log('Running migration:', file);
      await migration.up({ client, space, env });
      console.log('Completed migration:', file);
    } else {
      console.log('Skipping file (no up):', file);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
