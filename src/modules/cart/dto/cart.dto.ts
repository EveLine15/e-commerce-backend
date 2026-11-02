export class AddItemDto {
  productId: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export class UpdateQuantityDto {
  quantity: number;
}
