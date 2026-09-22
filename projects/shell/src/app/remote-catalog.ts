import { NgComponentOutlet } from '@angular/common';
import { Component, Type, input, signal } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { SearchHit } from './models';

@Component({
  selector: 'shell-remote-catalog',
  imports: [NgComponentOutlet],
  template: `
    @if (error()) {
      <div class="fail">
        <p>El micro-frontend de catálogo aún no responde en :4201.</p>
        <p>Arranca <code>ng serve catalog</code> y recarga.</p>
      </div>
    } @else if (component(); as cmp) {
      <ng-container [ngComponentOutlet]="cmp" [ngComponentOutletInputs]="inputs()" />
    } @else {
      <div class="boot">Montando el remote catalog…</div>
    }
  `,
  styles: `
    .fail,
    .boot {
      padding: 2rem 0;
      color: #9a9186;
      letter-spacing: 0.04em;
    }
    code {
      color: #d4b48c;
    }
  `,
})
export class RemoteCatalog {
  readonly hits = input<SearchHit[]>([]);
  readonly loading = input(false);
  readonly component = signal<Type<unknown> | null>(null);
  readonly error = signal(false);

  constructor() {
    void this.attach();
  }

  inputs() {
    return {
      hits: this.hits(),
      loading: this.loading(),
    };
  }

  private async attach() {
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        const module = await loadRemoteModule('catalog', './ProductGrid');
        this.component.set(module.ProductGrid);
        this.error.set(false);
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
    this.error.set(true);
  }
}
