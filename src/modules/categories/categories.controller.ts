import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service.ts';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get()
  async getCategories() {
    return this.categoriesService.findAll();
  }

  @Get('hierarchy')
  async getCategoriesTree() {
    return this.categoriesService.getCategoriesTree();
  }
}
