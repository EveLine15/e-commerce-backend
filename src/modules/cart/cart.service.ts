import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { FIRESTORE } from '../firebase/firebase.constants.js';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { AddItemDto } from './dto/cart.dto.js';
import { randomUUID } from 'crypto';

export interface CartItemStored {
  id: string;
  productId: string;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(
    @Inject(FIRESTORE)
    private readonly firestoreDB: Firestore,
  ) {}

  private getCartRef(cartId: string) {
    return this.firestoreDB.collection('cart').doc(cartId);
  }

  // Helper method to fetch product details and map required fields including unique cart item id
  private async enrichCartItems(items: CartItemStored[]) {
    if (!items || items.length === 0) {
      return [];
    }

    const productRefs = items.map((item) =>
      this.firestoreDB.collection('products').doc(item.productId),
    );

    const productSnapshots = await this.firestoreDB.getAll(...productRefs);

    return productSnapshots
      .map((docSnap, index) => {
        if (!docSnap.exists) {
          return null;
        }

        const productData = docSnap.data() as {
          imageUrl: string;
          name: string;
          price: number;
          salePercent: number;
          stock: string;
        };

        const cartItem = items[index];

        return {
          id: cartItem.id,
          productId: docSnap.id,
          product: {
            imageUrl: productData.imageUrl,
            name: productData.name,
            price: productData.price,
            salePercent: productData.salePercent,
            stock: productData.stock,
          },
          selectedColor: cartItem.selectedColor,
          selectedSize: cartItem.selectedSize,
          quantity: cartItem.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  // 1. Read Cart
  async getCart(cartId: string) {
    const docRef = this.getCartRef(cartId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { items: [] };
    }

    const rawItems = (docSnap.data()?.items || []) as CartItemStored[];
    const items = await this.enrichCartItems(rawItems);

    return { items };
  }

  // 2. Add Product to Cart (Increments if same variant exists, otherwise creates a new unique cart item entry)
  async addItem(cartId: string, dto: AddItemDto) {
    const docRef = this.getCartRef(cartId);
    const docSnap = await docRef.get();

    let rawItems: CartItemStored[] = [];
    if (docSnap.exists && docSnap.data()?.items) {
      rawItems = docSnap.data()?.items as CartItemStored[];
    }

    const existingIndex = rawItems.findIndex(
      (item) =>
        item.productId === dto.productId &&
        item.selectedColor === dto.selectedColor &&
        item.selectedSize === dto.selectedSize,
    );

    if (existingIndex > -1) {
      rawItems[existingIndex].quantity += dto.quantity;
    } else {
      rawItems.push({
        id: randomUUID(),
        productId: dto.productId,
        selectedColor: dto.selectedColor,
        selectedSize: dto.selectedSize,
        quantity: dto.quantity,
      });
    }

    await docRef.set(
      {
        items: rawItems,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const items = await this.enrichCartItems(rawItems);
    return { message: 'Item added successfully', items };
  }

  // 3. Change Product's Quantity using cartItemId
  async updateQuantity(cartId: string, cartItemId: string, quantity: number) {
    const docRef = this.getCartRef(cartId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new NotFoundException(`Cart with ID "${cartId}" not found`);
    }

    let rawItems = (docSnap.data()?.items || []) as CartItemStored[];
    const itemIndex = rawItems.findIndex((item) => item.id === cartItemId);

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Cart item with ID "${cartItemId}" not found`,
      );
    }

    if (quantity <= 0) {
      rawItems = rawItems.filter((item) => item.id !== cartItemId);
    } else {
      rawItems[itemIndex].quantity = quantity;
    }

    await docRef.set(
      {
        items: rawItems,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const items = await this.enrichCartItems(rawItems);
    return { message: 'Cart quantity updated', items };
  }

  // 4. Remove Product from Cart using cartItemId
  async removeItem(cartId: string, cartItemId: string) {
    const docRef = this.getCartRef(cartId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new NotFoundException(`Cart with ID "${cartId}" not found`);
    }

    let rawItems = (docSnap.data()?.items || []) as CartItemStored[];
    const initialLength = rawItems.length;

    rawItems = rawItems.filter((item) => item.id !== cartItemId);

    if (rawItems.length === initialLength) {
      throw new NotFoundException(
        `Cart item with ID "${cartItemId}" not found`,
      );
    }

    await docRef.set(
      {
        items: rawItems,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const items = await this.enrichCartItems(rawItems);
    return { message: 'Item removed from cart', items };
  }

  async clearCart(cartId: string): Promise<void> {
    const docRef = this.getCartRef(cartId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return; // If the cart doesn't exist, clearing it is inherently successful
    }

    await docRef.set(
      {
        items: [],
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}
