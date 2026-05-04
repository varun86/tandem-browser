import { NotImplementedError, type PlatformId } from '../errors';
import type { StealthUaAdapter } from '../types';

export function createDarwinStealthUaAdapter(): StealthUaAdapter {
  return {
    getUserAgent: (chromeVersion = process.versions.chrome) =>
      `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`,
    getClientHintsPlatform: () => 'macOS',
  };
}

export function createUnsupportedStealthUaAdapter(platform: PlatformId): StealthUaAdapter {
  return {
    getUserAgent: () => {
      throw new NotImplementedError('Stealth UA', platform, 'phase-7');
    },
    getClientHintsPlatform: () => {
      throw new NotImplementedError('Stealth UA', platform, 'phase-7');
    },
  };
}
