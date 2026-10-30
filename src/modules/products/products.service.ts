import { Inject, Injectable } from '@nestjs/common';
import type { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.constants.ts';
import { FilterProductsDto } from './dto/filter-product.dto.ts';
import { ProductSize } from './interfaces/products.interface.ts';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(FIRESTORE)
    private readonly firestoreDB: Firestore,
  ) {}

  async findAll(filters: FilterProductsDto = {}) {
    const snapshot = await this.firestoreDB.collection('products').get();
    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const search = filters.search;
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm),
      );
    }

    const categories = filters.category;
    if (categories && categories.length > 0) {
      products = products.filter((p) =>
        categories.some(
          (cat) =>
            p.category === cat ||
            (p.categoryAncestors && p.categoryAncestors.includes(cat)),
        ),
      );
    }

    const colors = filters.color;
    if (colors && colors.length > 0) {
      const targetColors = colors.map((c) => c.toLowerCase());
      products = products.filter(
        (p) =>
          p.colors &&
          p.colors.some((c: string) => targetColors.includes(c.toLowerCase())),
      );
    }

    const sizes = filters.size;
    if (sizes && sizes.length > 0) {
      products = products.filter(
        (p) => p.sizes && p.sizes.some((s: ProductSize) => sizes.includes(s)),
      );
    }

    const minPrice = filters.minPrice;
    if (minPrice !== undefined) {
      products = products.filter((p) => p.price >= minPrice);
    }

    const maxPrice = filters.maxPrice;
    if (maxPrice !== undefined) {
      products = products.filter((p) => p.price <= maxPrice);
    }

    const onSale = filters.onSale;
    if (onSale !== undefined) {
      if (onSale) {
        products = products.filter((p) => p.salePercent > 0);
      } else {
        products = products.filter(
          (p) => !p.salePercent || p.salePercent === 0,
        );
      }
    }

    const sortPrice = filters.sortPrice;
    if (sortPrice) {
      products.sort((a, b) => {
        if (sortPrice === 'asc') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    }

    return products;
  }

  async findOne(id: string) {
    const docSnap = await this.firestoreDB.collection('products').doc(id).get();
    return docSnap.data();
  }
}
