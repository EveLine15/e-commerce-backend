import { Injectable, Inject } from '@nestjs/common';
import { FIRESTORE } from '../firebase/firebase.constants.ts';
import { Firestore } from 'firebase-admin/firestore';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(FIRESTORE)
    private readonly firestoreDB: Firestore,
  ) {}

  async findAll() {
    const snapshot = await this.firestoreDB.collection('categories').get();

    return snapshot.docs.map((doc) => doc.data()) as {
      category: string;
      parentCategory: string | null;
    }[];
  }

  async getCategoriesTree() {
    const snapshot = await this.firestoreDB.collection('categories').get();

    const categories = snapshot.docs.map((doc) => doc.data()) as {
      category: string;
      parentCategory: string | null;
    }[];

    const categoryMap: Record<string, string[]> = {};

    categories.forEach((cat) => {
      if (!cat.parentCategory) {
        if (!categoryMap[cat.category]) {
          categoryMap[cat.category] = [];
        }
      }
    });

    categories.forEach((cat) => {
      if (cat.parentCategory) {
        if (!categoryMap[cat.parentCategory]) {
          categoryMap[cat.parentCategory] = [];
        }
        categoryMap[cat.parentCategory].push(cat.category);
      }
    });

    return categoryMap;
  }
}
