import type * as ChromeImportModule from '../../import/chrome-importer';
import path from 'path';
import os from 'os';
import { NotImplementedError, type PlatformId } from '../errors';
import type { ChromeImportAdapter } from '../types';

export function createDarwinChromeImportAdapter(): ChromeImportAdapter {
  return {
    createImporter: (configManager) => {
      const { ChromeImporter } = require('../../import/chrome-importer') as typeof ChromeImportModule;
      return new ChromeImporter(configManager);
    },
    getDefaultChromeBasePath: () => path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome'),
    getUnavailableStatus: (profilePath = '') => ({
      chromeFound: false,
      bookmarksFound: false,
      historyFound: false,
      cookiesFound: false,
      profilePath,
    }),
  };
}

export function createUnsupportedChromeImportAdapter(platform: PlatformId): ChromeImportAdapter {
  return {
    createImporter: () => {
      throw new NotImplementedError('Chrome import', platform, 'phase-8');
    },
    getDefaultChromeBasePath: () => '',
    getUnavailableStatus: (profilePath = '') => ({
      chromeFound: false,
      bookmarksFound: false,
      historyFound: false,
      cookiesFound: false,
      profilePath,
    }),
  };
}
