import { Injectable, computed, signal } from '@angular/core';
import { Product } from './models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly items = signal<Product[]>([]);
  readonly open = signal(false);
  readonly lines = this.items.asReadonly();
  readonly count = computed(() => this.items().length);
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.price, 0));

  add(product: Product) {
    this.items.update((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current;
      }
      return [...current, product];
    });
    this.open.set(true);
  }

  remove(id: string) {
    this.items.update((current) => current.filter((item) => item.id !== id));
  }

  toggle() {
    this.open.update((value) => !value);
  }

  close() {
    this.open.set(false);
  }
}
