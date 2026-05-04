import type * as PathsModule from '../../utils/paths';
import { NotImplementedError, type PlatformId } from '../errors';
import type { PathsAdapter } from '../types';

export function createDarwinPathsAdapter(): PathsAdapter {
  return {
    tandemDir: (...subpath) => {
      const { tandemDir } = require('../../utils/paths') as typeof PathsModule;
      return tandemDir(...subpath);
    },
    ensureDir: (dir) => {
      const { ensureDir } = require('../../utils/paths') as typeof PathsModule;
      return ensureDir(dir);
    },
  };
}

export function createUnsupportedPathsAdapter(platform: PlatformId): PathsAdapter {
  return {
    tandemDir: () => {
      throw new NotImplementedError('User data paths', platform, 'phase-4');
    },
    ensureDir: () => {
      throw new NotImplementedError('User data paths', platform, 'phase-4');
    },
  };
}
