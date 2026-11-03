import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module.js';
import { FirebaseModule } from './modules/firebase/firebase.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { SupportModule } from './modules/support/support.module.js';

@Module({
  imports: [ProductsModule, FirebaseModule, CategoriesModule, CartModule, SupportModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
