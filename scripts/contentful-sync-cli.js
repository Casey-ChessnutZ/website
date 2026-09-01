const path = require('path');
const { spawn } = require('child_process');
const { getSyncRegistry } = require('./contentful-sync-registry');
const { runInteractiveSync } = require('./contentful-sync-cli-core');

function runSelected({ operation, selectedIds }) {
  const environment = {
    ...process.env,
    CONTENTFUL_SYNC_CONTENT_TYPES: selectedIds.join(','),
    CONTENTFUL_SKIP_MODEL_SYNC: operation === 'model' ? '' : 'true',
    CONTENTFUL_MODEL_ONLY: operation === 'model' ? 'true' : '',
    CONTENTFUL_UPSERT_CONTENT_TYPES: operation === 'data-update' ? selectedIds.join(',') : '',
  };

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'contentful-zero-touch.js')], {
      env: environment,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`Contentful sync exited with status ${code}.`)));
  });
}

async function main() {
  const { checkbox, confirm, select } = await import('@inquirer/prompts');
  const result = await runInteractiveSync({
    isTTY: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    prompts: { checkbox, confirm, select },
    registry: getSyncRegistry(),
    runSelected,
  });
  if (result === 'cancelled') console.log('Contentful sync cancelled. No remote changes were made.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
