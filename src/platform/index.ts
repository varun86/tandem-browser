import { getPlatformCapabilities, normalizePlatform } from './capabilities';
import type { PlatformId } from './errors';
import { createDarwinChromeImportAdapter, createUnsupportedChromeImportAdapter } from './chrome-import';
import { createDarwinNativeMessagingAdapter, createUnsupportedNativeMessagingAdapter } from './native-messaging';
import { createDarwinPathsAdapter, createUnsupportedPathsAdapter } from './paths';
import { createProcessAdapter } from './process';
import { createDarwinSecretsAdapter, createUnsupportedSecretsAdapter } from './secrets';
import { createDarwinStealthUaAdapter, createUnsupportedStealthUaAdapter } from './stealth-ua';
import type { PlatformAdapter } from './types';
import { createDarwinVideoAudioAdapter, createUnsupportedVideoAudioAdapter } from './video-audio';
import { createDarwinVoiceAdapter, createUnsupportedVoiceAdapter } from './voice';
import { createDarwinWindowChromeAdapter, createUnsupportedWindowChromeAdapter } from './window-chrome';

export type { PlatformId } from './errors';
export { NotImplementedError } from './errors';
export type {
  CapabilityStatus,
  PlatformCapabilities,
  PlatformCapability,
  PlatformSupportProfile,
} from './capabilities';
export { getPlatformCapabilities, normalizePlatform } from './capabilities';
export type { PlatformAdapter } from './types';

function createDarwinPlatform(): PlatformAdapter {
  const id: PlatformId = 'darwin';
  return {
    id,
    capabilities: getPlatformCapabilities(id),
    paths: createDarwinPathsAdapter(),
    process: createProcessAdapter(id),
    chromeImport: createDarwinChromeImportAdapter(),
    nativeMessaging: createDarwinNativeMessagingAdapter(),
    voice: createDarwinVoiceAdapter(),
    videoAudio: createDarwinVideoAudioAdapter(),
    windowChrome: createDarwinWindowChromeAdapter(),
    stealthUa: createDarwinStealthUaAdapter(),
    secrets: createDarwinSecretsAdapter(),
  };
}

function createStubPlatform(id: PlatformId): PlatformAdapter {
  return {
    id,
    capabilities: getPlatformCapabilities(id),
    paths: createUnsupportedPathsAdapter(id),
    process: createProcessAdapter(id),
    chromeImport: createUnsupportedChromeImportAdapter(id),
    nativeMessaging: createUnsupportedNativeMessagingAdapter(id),
    voice: createUnsupportedVoiceAdapter(id),
    videoAudio: createUnsupportedVideoAudioAdapter(id),
    windowChrome: createUnsupportedWindowChromeAdapter(id),
    stealthUa: createUnsupportedStealthUaAdapter(id),
    secrets: createUnsupportedSecretsAdapter(id),
  };
}

export function selectPlatform(platform: NodeJS.Platform | string = process.platform): PlatformAdapter {
  const id = normalizePlatform(platform);
  if (id === 'darwin') {
    return createDarwinPlatform();
  }
  return createStubPlatform(id);
}
