export class FilterProductsDto {
  search?: string;
  category?: string;
  color?: string;
  size?: ProductSize;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sortPrice?: 'asc' | 'desc';
}
type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
