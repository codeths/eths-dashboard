import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export const MessagingInjectionToken = 'MESSAGING_PROVIDER';

export const MessagingProvider = {
  provide: MessagingInjectionToken,
  useFactory: async () => {
    const app = initializeApp({ credential: applicationDefault() });
    return getMessaging(app);
  },
};
