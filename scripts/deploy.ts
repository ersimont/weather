import { assert } from '@s-libs/js-core';
import { program } from 'commander';
import { $ } from 'zx';

const sourceDir = 'dist/weather';
const bugsnagApiKey = 'ed6690791c812d163fb92d4ad7a21ef4';

$.shell = 'powershell.exe';
$.prefix = '';

program
  .command('production')
  .description('deploy to production')
  .action(async () => {
    await compileProduction();
    await deployProduction();
    // await uploadSourcemaps('https://weather.simonton.app');
  });

program
  .command('staging [channelId]')
  .description('deploy to staging')
  .action(async (channelId = 'staging') => {
    await compileStaging();
    const baseUrl = await deployStaging(channelId);
    // await uploadSourcemaps(baseUrl);
  });

await program.parseAsync();

async function compileStaging(): Promise<void> {
  console.log('compiling staging code...');
  await $`ng build --configuration=staging`;
}

async function compileProduction(): Promise<void> {
  console.log('compiling production code...');
  await $`ng build`;
}

async function deployStaging(channelId: string): Promise<string> {
  console.log(`deploying to preview channel ${channelId}...`);
  const { stdout } = await $`firebase hosting:channel:deploy ${channelId}`.pipe(
    process.stdout,
  );
  const matches = stdout.match(
    /https:\/\/simonton-weather--staging-\S+\.web\.app/u,
  );
  assert(matches);
  return matches[0];
}

async function deployProduction(): Promise<void> {
  console.log('deploying to production...');
  await $`firebase deploy --only hosting`;
}

// TODO: the bugsnag CLI is not installing properly. Try again later.
// async function uploadSourcemaps(baseUrl: string): Promise<void> {
//   console.log('uploading sourcemaps...');
//   await $({
//     cwd: sourceDir,
//   })`npx bugsnag-cli upload js --api-key=${bugsnagApiKey} --baseUrl=${baseUrl}`;
// }
