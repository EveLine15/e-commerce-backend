import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AddItemDto, UpdateQuantityDto } from './dto/cart.dto.js';
import { FirebaseAuthGuard } from '../firebase/guards/firebase-auth.guard.js';
import { CurrentUserId } from '../../common/decorators/current-user.decorator.js';

@Controller('cart')
@UseGuards(FirebaseAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUserId() userId: string) {
    return await this.cartService.getCart(userId);
  }

  @Post('items')
  async addItem(@CurrentUserId() userId: string, @Body() dto: AddItemDto) {
    return await this.cartService.addItem(userId, dto);
  }

  @Patch('items/:cartItemId')
  async updateQuantity(
    @CurrentUserId() userId: string,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateQuantityDto,
  ) {
    return await this.cartService.updateQuantity(
      userId,
      cartItemId,
      dto.quantity,
    );
  }

  @Delete('items/:cartItemId')
  async removeItem(
    @CurrentUserId() userId: string,
    @Param('cartItemId') cartItemId: string,
  ) {
    return await this.cartService.removeItem(userId, cartItemId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@CurrentUserId() userId: string): Promise<void> {
    await this.cartService.clearCart(userId);
  }
}
