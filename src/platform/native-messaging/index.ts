import type * as NativeMessagingModule from '../../extensions/native-messaging';
import { NotImplementedError, type PlatformId } from '../errors';
import type { NativeMessagingAdapter } from '../types';

export function createDarwinNativeMessagingAdapter(): NativeMessagingAdapter {
  return {
    createSetup: () => {
      const { NativeMessagingSetup } = require('../../extensions/native-messaging') as typeof NativeMessagingModule;
      return new NativeMessagingSetup();
    },
  };
}

export function createUnsupportedNativeMessagingAdapter(platform: PlatformId): NativeMessagingAdapter {
  return {
    createSetup: () => {
      throw new NotImplementedError('NativeMessaging', platform, 'phase-9');
    },
  };
}
