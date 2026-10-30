import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service.ts';
import { FilterProductsDto } from './dto/filter-product.dto.ts';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async getProducts(@Body() filters: FilterProductsDto) {
    return await this.productsService.findAll(filters);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }
}
