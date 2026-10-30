import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module.js';
import { FirebaseModule } from './modules/firebase/firebase.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';

@Module({
  imports: [ProductsModule, FirebaseModule, CategoriesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
