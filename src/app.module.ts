import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module.js';
import { FirebaseModule } from './modules/firebase/firebase.module.js';

@Module({
  imports: [ProductsModule, FirebaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
