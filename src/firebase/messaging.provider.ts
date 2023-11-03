import * as admin from 'firebase-admin'; // https://github.com/firebase/firebase-admin-node/issues/593
import { getMessaging } from 'firebase-admin/messaging';
import * as firebaseConfig from '../../firebase.json';

export const MessagingInjectionToken = 'MESSAGING_PROVIDER';

export const MessagingProvider = {
  provide: MessagingInjectionToken,
  useFactory: async () => {
    const app = admin.initializeApp(firebaseConfig);
    return getMessaging(app);
  },
};
