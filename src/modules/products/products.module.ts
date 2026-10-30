import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.ts';
import { ProductsService } from './products.service.ts';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
