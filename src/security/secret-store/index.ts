import fs from 'fs';
import path from 'path';
import { tandemDir } from '../../utils/paths';

type SecretEncoding = 'safe-storage' | 'plaintext-fallback-on-init';

export interface SafeStorageProvider {
  isEncryptionAvailable(): boolean;
  encryptString(plainText: string): Buffer;
  decryptString(encrypted: Buffer): string;
  getSelectedStorageBackend?(): string;
}

export interface SecretStoreRecord {
  version: 1;
  key: string;
  encoding: SecretEncoding;
  createdAt: string;
  updatedAt: string;
  ciphertext?: string;
  plaintext?: string;
  fallbackReason?: string;
}

export interface SecretStoreSetResult {
  encoding: SecretEncoding;
  path: string;
}

export interface SecretStoreOptions {
  rootDir?: string;
  safeStorage?: SafeStorageProvider;
  allowPlaintextFallbackOnInit?: boolean;
  now?: () => Date;
}

const KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;

/**
 * Stores Electron-owned secrets using Electron safeStorage when available.
 * During very early app startup, safeStorage can be unavailable; callers may
 * allow an explicit plaintext fallback record for initialization-only paths.
 */
export class SecretStore {
  private readonly rootDir: string;
  private readonly safeStorage?: SafeStorageProvider;
  private readonly allowPlaintextFallbackOnInit: boolean;
  private readonly now: () => Date;

  constructor(options: SecretStoreOptions = {}) {
    this.rootDir = options.rootDir ?? tandemDir('secret-store');
    this.safeStorage = options.safeStorage;
    this.allowPlaintextFallbackOnInit = options.allowPlaintextFallbackOnInit ?? true;
    this.now = options.now ?? (() => new Date());
  }

  get(key: string): string | null {
    const recordPath = this.getRecordPath(key);
    if (!fs.existsSync(recordPath)) {
      return null;
    }

    const record = this.readRecord(recordPath);
    if (record.encoding === 'plaintext-fallback-on-init') {
      return record.plaintext ?? null;
    }

    if (!record.ciphertext) {
      throw new Error(`Secret store record ${key} is missing ciphertext`);
    }

    const safeStorage = this.getSafeStorage();
    return safeStorage.decryptString(Buffer.from(record.ciphertext, 'base64'));
  }

  set(key: string, value: string): SecretStoreSetResult {
    const recordPath = this.getRecordPath(key);
    const existing = fs.existsSync(recordPath) ? this.readRecord(recordPath) : null;
    const timestamp = this.now().toISOString();
    const base = {
      version: 1 as const,
      key,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    const safeStorage = this.getSafeStorage();
    let record: SecretStoreRecord;
    if (safeStorage.isEncryptionAvailable()) {
      record = {
        ...base,
        encoding: 'safe-storage',
        ciphertext: safeStorage.encryptString(value).toString('base64'),
      };
    } else {
      if (!this.allowPlaintextFallbackOnInit) {
        throw new Error('Electron safeStorage encryption is not available');
      }

      record = {
        ...base,
        encoding: 'plaintext-fallback-on-init',
        plaintext: value,
        fallbackReason: 'Electron safeStorage encryption was unavailable during initialization',
      };
    }

    fs.mkdirSync(path.dirname(recordPath), { recursive: true });
    fs.writeFileSync(recordPath, JSON.stringify(record, null, 2), { mode: 0o600 });
    try { fs.chmodSync(recordPath, 0o600); } catch { /* best effort on platforms without chmod semantics */ }
    return { encoding: record.encoding, path: recordPath };
  }

  delete(key: string): void {
    const recordPath = this.getRecordPath(key);
    if (fs.existsSync(recordPath)) {
      fs.unlinkSync(recordPath);
    }
  }

  getRecordPath(key: string): string {
    this.validateKey(key);
    return path.join(this.rootDir, `${key}.json`);
  }

  private readRecord(recordPath: string): SecretStoreRecord {
    const parsed = JSON.parse(fs.readFileSync(recordPath, 'utf-8')) as Partial<SecretStoreRecord>;
    if (
      parsed.version !== 1 ||
      typeof parsed.key !== 'string' ||
      (parsed.encoding !== 'safe-storage' && parsed.encoding !== 'plaintext-fallback-on-init')
    ) {
      throw new Error(`Invalid secret store record: ${recordPath}`);
    }
    return parsed as SecretStoreRecord;
  }

  private validateKey(key: string): void {
    if (!KEY_PATTERN.test(key)) {
      throw new Error(`Invalid secret key name: ${key}`);
    }
  }

  private getSafeStorage(): SafeStorageProvider {
    if (this.safeStorage) {
      return this.safeStorage;
    }

    const electron = require('electron') as { safeStorage?: SafeStorageProvider };
    if (!electron.safeStorage) {
      throw new Error('Electron safeStorage is not available outside the Electron main process');
    }
    return electron.safeStorage;
  }
}

let defaultSecretStore: SecretStore | null = null;

export function getDefaultSecretStore(): SecretStore {
  defaultSecretStore ??= new SecretStore();
  return defaultSecretStore;
}
