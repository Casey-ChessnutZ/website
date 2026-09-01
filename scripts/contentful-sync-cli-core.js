const operationChoices = [
  { name: 'Sync content type schema and editor controls', value: 'model' },
  { name: 'Create missing seeded content', value: 'data-create' },
  { name: 'Update selected seeded content', value: 'data-update' },
];

async function runInteractiveSync({ isTTY, prompts, registry, runSelected }) {
  if (!isTTY) {
    throw new Error('Interactive Contentful sync requires a TTY. Use npm run contentful:sync:non-interactive in CI.');
  }

  const operation = await prompts.select({ message: 'Choose Contentful operation', choices: operationChoices });
  const selectedIds = await prompts.checkbox({
    message: 'Select content types (Space toggles; Enter confirms)',
    choices: registry.map(({ id, label }) => ({ name: label, value: id })),
  });

  if (!selectedIds.length) return 'cancelled';

  const confirmed = await prompts.confirm({
    message: `Apply ${operation} to: ${selectedIds.join(', ')}?`,
    default: false,
  });
  if (!confirmed) return 'cancelled';

  await runSelected({ operation, selectedIds });
  return 'completed';
}

module.exports = { operationChoices, runInteractiveSync };
