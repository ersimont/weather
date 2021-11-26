import { browser } from '@bugsnag/source-maps';
import { execSync } from 'child_process';
import { program } from 'commander';
import * as fs from 'fs';
import { join } from 'path';

const sourceDir = 'dist/weather';
const bugsnagApiKey = 'ed6690791c812d163fb92d4ad7a21ef4';

program
  .command('production')
  .description('deploy to production')
  .action(async () => {
    compileProduction();
    await uploadSourcemaps();
    deployProduction();
  });

program
  .command('staging [channelId]')
  .description('deploy to staging')
  .action(async (channelId = 'staging') => {
    // compileStaging();
    await uploadSourcemaps();
    deployStaging(channelId);
  });

program.parseAsync(process.argv);

function compileStaging(): void {
  console.log('compiling staging code...');
  execSync('ng build --configuration=staging', { stdio: 'inherit' });
}

function compileProduction(): void {
  console.log('compiling production code...');
  execSync('ng build', { stdio: 'inherit' });
}

async function uploadSourcemaps(): Promise<void> {
  const sourceFileNames = fs
    .readdirSync(sourceDir)
    .filter((fileName) => fileName.match(/.*.map/));
  for (const sourceFileName of sourceFileNames) {
    console.log('uploading', sourceFileName);
    const sourceMap = join(sourceDir, sourceFileName);
    const bundleUrl = '*/' + sourceFileName.slice(0, -4);
    await browser.uploadOne({
      apiKey: bugsnagApiKey,
      bundleUrl,
      sourceMap,
      overwrite: true,
    });
  }
}

function deployStaging(channelId: string): void {
  console.log(`deploying to preview channel ${channelId}...`);
  execSync(`firebase hosting:channel:deploy ${channelId}`, {
    stdio: 'inherit',
  });
}

function deployProduction(): void {
  console.log('deploying to production...');
  execSync('firebase deploy --only hosting', { stdio: 'inherit' });
}
