import { describe, expect, it } from 'vitest';
import os from 'os';
import path from 'path';
import { NotImplementedError, getPlatformCapabilities, selectPlatform } from '..';

describe('selectPlatform', () => {
  it('returns the Darwin adapter', () => {
    const platform = selectPlatform('darwin');

    expect(platform.id).toBe('darwin');
    expect(platform.process.isMacOS()).toBe(true);
    expect(platform.capabilities.capabilities.appStartup.status).toBe('supported');
    expect(platform.paths.tandemDir('foo')).toBe(path.join(os.homedir(), '.tandem', 'foo'));
    expect(platform.windowChrome.getBrowserWindowOptions()).toMatchObject({
      titleBarStyle: 'hiddenInset',
    });
  });

  it('returns the Windows adapter without throwing on capability reads', () => {
    const platform = selectPlatform('win32');

    expect(platform.id).toBe('win32');
    expect(platform.process.isWindows()).toBe(true);
    expect(platform.capabilities.capabilities.appStartup.status).toBe('unsupported');
    expect(platform.capabilities.capabilities.windowChrome.status).toBe('supported');
    expect(platform.capabilities.capabilities.userDataDirectory.status).toBe('supported');
    expect(() => platform.chromeImport.getUnavailableStatus()).not.toThrow();
    expect(platform.windowChrome.getBrowserWindowOptions()).toMatchObject({
      frame: false,
    });
  });

  it('returns the Linux stub adapter without throwing on capability reads', () => {
    const platform = selectPlatform('linux');

    expect(platform.id).toBe('linux');
    expect(platform.process.isLinux()).toBe(true);
    expect(platform.capabilities.capabilities.windowChrome.status).toBe('supported');
    expect(platform.paths.tandemDir('foo')).toBe(path.join(os.homedir(), '.tandem', 'foo'));
    expect(() => platform.chromeImport.getUnavailableStatus()).not.toThrow();
    expect(platform.windowChrome.getBrowserWindowOptions()).toMatchObject({
      frame: false,
    });
    expect(() => platform.secrets.loadOrCreateInstallSecret()).toThrow(NotImplementedError);
  });

  it('normalizes unknown platforms to an unsupported adapter', () => {
    const platform = selectPlatform('freebsd');

    expect(platform.id).toBe('unsupported');
    expect(platform.capabilities.tier).toBe('unsupported');
    expect(getPlatformCapabilities('freebsd').capabilities.appStartup.status).toBe('unsupported');
  });

  it('uses APPDATA/Tandem Browser for Windows user data paths', () => {
    const originalAppData = process.env.APPDATA;
    const appData = path.join(os.tmpdir(), 'tandem-appdata-test');
    process.env.APPDATA = appData;

    try {
      const platform = selectPlatform('win32');

      expect(platform.paths.tandemDir('foo')).toBe(path.join(appData, 'Tandem Browser', 'foo'));
    } finally {
      if (originalAppData === undefined) {
        delete process.env.APPDATA;
      } else {
        process.env.APPDATA = originalAppData;
      }
    }
  });
});
