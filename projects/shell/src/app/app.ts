import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from './cart.service';
import { Product } from './models';
import { RemoteCatalog } from './remote-catalog';
import { SearchService } from './search.service';

@Component({
  selector: 'shell-root',
  imports: [FormsModule, CurrencyPipe, RemoteCatalog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  readonly search = inject(SearchService);
  readonly cart = inject(CartService);

  readonly draft = signal('ropa para ir a la playa de noche');
  readonly placeholder = signal('Describe el momento, no la palabra');
  readonly liveChips = signal<string[]>(['Playa', 'Noche', 'Atuendo']);

  readonly examples = [
    'ropa para ir a la playa de noche',
    'ropa para la plalla de noche',
    'algo cómodo para oficina en verano',
    'zapatos para correr cuando llueve',
    'outfit para una cita elegante',
  ];

  readonly visibleChips = computed(() => {
    const fromApi = this.search.result()?.intent.chips.map((chip) => chip.label) ?? [];
    return fromApi.length ? fromApi : this.liveChips();
  });

  constructor() {
    window.addEventListener('mare:add-to-cart', this.onRemoteAdd);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('mare:add-to-cart', this.onRemoteAdd);
    });
    this.search.search(this.draft());
  }

  onDraft(value: string) {
    this.draft.set(value);
    this.liveChips.set(this.search.previewIntent(value));
    this.search.search(value);
  }

  useExample(example: string) {
    this.onDraft(example);
  }

  setMode(mode: 'semantic' | 'keyword') {
    this.search.setMode(mode);
  }

  private onRemoteAdd = (event: Event) => {
    const product = (event as CustomEvent<Product>).detail;
    if (product) {
      this.cart.add(product);
    }
  };
}
