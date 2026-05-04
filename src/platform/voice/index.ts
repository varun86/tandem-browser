import type * as SpeechTranscriberModule from '../../voice/speech-transcriber';
import { NotImplementedError, type PlatformId } from '../errors';
import type { VoiceAdapter } from '../types';

export function createDarwinVoiceAdapter(): VoiceAdapter {
  return {
    detectBackend: () => {
      const { detectBackend } = require('../../voice/speech-transcriber') as typeof SpeechTranscriberModule;
      return detectBackend();
    },
    transcribeAudio: async (audioBuffer, language) => {
      const { transcribeAudio } = require('../../voice/speech-transcriber') as typeof SpeechTranscriberModule;
      return transcribeAudio(audioBuffer, language);
    },
  };
}

export function createUnsupportedVoiceAdapter(platform: PlatformId): VoiceAdapter {
  return {
    detectBackend: () => 'none',
    transcribeAudio: async () => {
      throw new NotImplementedError('Voice transcription', platform, 'phase-10');
    },
  };
}
