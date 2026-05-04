import { describe, expect, it } from 'vitest';
import { NotImplementedError, getPlatformCapabilities, selectPlatform } from '..';

describe('selectPlatform', () => {
  it('returns the Darwin adapter', () => {
    const platform = selectPlatform('darwin');

    expect(platform.id).toBe('darwin');
    expect(platform.process.isMacOS()).toBe(true);
    expect(platform.capabilities.capabilities.appStartup.status).toBe('supported');
    expect(platform.windowChrome.getBrowserWindowOptions()).toMatchObject({
      titleBarStyle: 'hiddenInset',
    });
  });

  it('returns the Windows stub adapter without throwing on capability reads', () => {
    const platform = selectPlatform('win32');

    expect(platform.id).toBe('win32');
    expect(platform.process.isWindows()).toBe(true);
    expect(platform.capabilities.capabilities.appStartup.status).toBe('unsupported');
    expect(() => platform.chromeImport.getUnavailableStatus()).not.toThrow();
    expect(() => platform.windowChrome.getBrowserWindowOptions()).toThrow(NotImplementedError);
  });

  it('returns the Linux stub adapter without throwing on capability reads', () => {
    const platform = selectPlatform('linux');

    expect(platform.id).toBe('linux');
    expect(platform.process.isLinux()).toBe(true);
    expect(platform.capabilities.capabilities.windowChrome.status).toBe('supported');
    expect(() => platform.chromeImport.getUnavailableStatus()).not.toThrow();
    expect(() => platform.secrets.loadOrCreateInstallSecret()).toThrow(NotImplementedError);
  });

  it('normalizes unknown platforms to an unsupported adapter', () => {
    const platform = selectPlatform('freebsd');

    expect(platform.id).toBe('unsupported');
    expect(platform.capabilities.tier).toBe('unsupported');
    expect(getPlatformCapabilities('freebsd').capabilities.appStartup.status).toBe('unsupported');
  });
});
