import { Global, Module, InternalServerErrorException } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { FIRESTORE } from './firebase.constants.ts';

@Global()
@Module({
  providers: [
    {
      provide: FIRESTORE,
      useFactory: () => {
        const serviceAccountKeyBase64 =
          process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!serviceAccountKeyBase64) {
          throw new InternalServerErrorException(
            'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is missing',
          );
        }

        const serviceAccountJsonString = Buffer.from(
          serviceAccountKeyBase64,
          'base64',
        ).toString('utf8');

        const serviceAccount = JSON.parse(serviceAccountJsonString);

        const app =
          getApps()[0] ??
          initializeApp({
            credential: cert(serviceAccount),
          });

        return getFirestore(app);
      },
    },
  ],
  exports: [FIRESTORE],
})
export class FirebaseModule {}
