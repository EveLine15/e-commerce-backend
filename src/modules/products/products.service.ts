import { Inject, Injectable } from '@nestjs/common';
import type { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.constants.ts';
import { FilterProductsDto } from './dto/filter-product.dto.ts';

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

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm),
      );
    }

    if (filters.category) {
      const targetCategory = filters.category;
      products = products.filter(
        (p) =>
          p.category === targetCategory ||
          (p.categoryAncestors && p.categoryAncestors.includes(targetCategory)),
      );
    }

    if (filters.color) {
      const targetColor = filters.color.toLowerCase();
      products = products.filter(
        (p) =>
          p.colors &&
          p.colors.some((c: string) => c.toLowerCase() === targetColor),
      );
    }

    if (filters.size) {
      products = products.filter(
        (p) => p.sizes && p.sizes.includes(filters.size),
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

    if (filters.onSale !== undefined) {
      if (filters.onSale) {
        products = products.filter((p) => p.salePercent > 0);
      } else {
        products = products.filter(
          (p) => !p.salePercent || p.salePercent === 0,
        );
      }
    }

    if (filters.sortPrice) {
      products.sort((a, b) => {
        if (filters.sortPrice === 'asc') {
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
