import type { Session } from 'electron';
import type { ConfigManager } from '../config/manager';
import type { ChromeImporter, ChromeImportStatus } from '../import/chrome-importer';
import type {
  NativeMessagingHost,
  NativeMessagingHostAccessDecision,
  NativeMessagingStatus,
} from '../extensions/native-messaging';
import type { PlatformId } from './errors';
import type { PlatformSupportProfile } from './capabilities';

export interface PathsAdapter {
  tandemDir(...subpath: string[]): string;
  ensureDir(dir: string): string;
}

export interface ProcessAdapter {
  platform: PlatformId;
  isMacOS(): boolean;
  isWindows(): boolean;
  isLinux(): boolean;
}

export interface ChromeImportAdapter {
  createImporter(configManager?: ConfigManager): ChromeImporter;
  getDefaultChromeBasePath(): string;
  getUnavailableStatus(profilePath?: string): ChromeImportStatus;
}

export interface NativeMessagingAdapter {
  createSetup(): {
    getNativeMessagingDirs(): { path: string; exists: boolean }[];
    detectHosts(): NativeMessagingHost[];
    configure(session: Session): { configured: string[]; missing: string[] };
    getStatus(): NativeMessagingStatus;
    evaluateHostAccess(hostName: string, candidateExtensionIds: Array<string | null | undefined>): NativeMessagingHostAccessDecision;
    isHostAvailable(extensionId: string): boolean;
  };
}

export interface VoiceAdapter {
  detectBackend(): 'apple' | 'whisper' | 'none';
  transcribeAudio(audioBuffer: Buffer, language?: string): Promise<{ ok: boolean; text?: string; error?: string }>;
}

export interface VideoAudioAdapter {
  createRecorder(): {
    startRecording(mode: 'application' | 'region', region?: { x: number; y: number; width: number; height: number }): { ok: boolean; id?: string; error?: string };
    writeChunk(data: Buffer): void;
    stopRecording(): Promise<{ ok: boolean; recording?: unknown; error?: string }>;
    isRecording(): boolean;
    getStatus(): { recording: boolean; id?: string; duration?: number; mode?: string };
    listRecordings(limit?: number): unknown[];
    forceStop(): void;
  };
}

export interface WindowChromeAdapter {
  getBrowserWindowOptions(): Partial<Electron.BrowserWindowConstructorOptions>;
}

export interface StealthUaAdapter {
  getUserAgent(chromeVersion?: string): string;
  getClientHintsPlatform(): string;
}

export interface SecretsAdapter {
  loadOrCreateInstallSecret(): string;
}

export interface PlatformAdapter {
  id: PlatformId;
  capabilities: PlatformSupportProfile;
  paths: PathsAdapter;
  process: ProcessAdapter;
  chromeImport: ChromeImportAdapter;
  nativeMessaging: NativeMessagingAdapter;
  voice: VoiceAdapter;
  videoAudio: VideoAudioAdapter;
  windowChrome: WindowChromeAdapter;
  stealthUa: StealthUaAdapter;
  secrets: SecretsAdapter;
}
