import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SecretStore, type SafeStorageProvider } from '../secret-store';

function createTempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tandem-secret-store-'));
}

function createSafeStorageMock(encryptionAvailable = true): SafeStorageProvider {
  return {
    isEncryptionAvailable: vi.fn(() => encryptionAvailable),
    encryptString: vi.fn((plainText: string) => Buffer.from(`encrypted:${plainText}`, 'utf-8')),
    decryptString: vi.fn((encrypted: Buffer) => {
      const value = encrypted.toString('utf-8');
      if (!value.startsWith('encrypted:')) {
        throw new Error('Invalid ciphertext');
      }
      return value.slice('encrypted:'.length);
    }),
  };
}

describe('SecretStore', () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('stores and reads encrypted records through Electron safeStorage', () => {
    const rootDir = createTempRoot();
    tempRoots.push(rootDir);
    const safeStorage = createSafeStorageMock(true);
    const store = new SecretStore({ rootDir, safeStorage });

    const result = store.set('oauth-refresh', 'refresh-token');
    const recordText = fs.readFileSync(result.path, 'utf-8');
    const record = JSON.parse(recordText) as { encoding: string; ciphertext?: string; plaintext?: string };

    expect(result.encoding).toBe('safe-storage');
    expect(record.encoding).toBe('safe-storage');
    expect(record.ciphertext).toBe(Buffer.from('encrypted:refresh-token').toString('base64'));
    expect(record.plaintext).toBeUndefined();
    expect(store.get('oauth-refresh')).toBe('refresh-token');
    expect(safeStorage.decryptString).toHaveBeenCalledOnce();
  });

  it('writes a plaintext fallback record when safeStorage is unavailable during init', () => {
    const rootDir = createTempRoot();
    tempRoots.push(rootDir);
    const safeStorage = createSafeStorageMock(false);
    const store = new SecretStore({ rootDir, safeStorage });

    const result = store.set('early-init-secret', 'bootstrap-secret');
    const record = JSON.parse(fs.readFileSync(result.path, 'utf-8')) as {
      encoding: string;
      plaintext?: string;
      fallbackReason?: string;
    };

    expect(result.encoding).toBe('plaintext-fallback-on-init');
    expect(record.encoding).toBe('plaintext-fallback-on-init');
    expect(record.plaintext).toBe('bootstrap-secret');
    expect(record.fallbackReason).toContain('safeStorage encryption was unavailable');
    expect(store.get('early-init-secret')).toBe('bootstrap-secret');
    expect(safeStorage.encryptString).not.toHaveBeenCalled();
  });

  it('deletes records by key', () => {
    const rootDir = createTempRoot();
    tempRoots.push(rootDir);
    const store = new SecretStore({ rootDir, safeStorage: createSafeStorageMock(true) });

    const result = store.set('to-delete', 'secret');
    expect(fs.existsSync(result.path)).toBe(true);

    store.delete('to-delete');
    expect(fs.existsSync(result.path)).toBe(false);
    expect(store.get('to-delete')).toBeNull();
  });

  it('rejects unsafe key names', () => {
    const rootDir = createTempRoot();
    tempRoots.push(rootDir);
    const store = new SecretStore({ rootDir, safeStorage: createSafeStorageMock(true) });

    expect(() => store.set('../escape', 'secret')).toThrow('Invalid secret key name');
    expect(() => store.get('nested/path')).toThrow('Invalid secret key name');
  });
});
