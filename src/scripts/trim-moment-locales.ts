// https://github.com/angular/angular-cli/issues/6137#issuecomment-517631898

import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const localeDir = join('node_modules', 'moment', 'locale');
const localesToKeep = new Set<string>([]);

const files = readdirSync(localeDir);
for (const file of files) {
  if (localesToKeep.has(file)) {
    console.log('keeping', file);
    continue;
  }

  console.log('removing', file);
  const filePath = join(localeDir, file);
  unlinkSync(filePath);
}
