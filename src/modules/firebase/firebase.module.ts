import { Global, Module } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { FIRESTORE } from './firebase.constants.ts';

@Global()
@Module({
  providers: [
    {
      provide: FIRESTORE,
      useFactory: () => {
        const servicePath = path.join(process.cwd(), 'serviceAccountKey.json');

        const serviceAccount = JSON.parse(fs.readFileSync(servicePath, 'utf8'));

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
